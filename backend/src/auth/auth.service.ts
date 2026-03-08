/**
 * @file auth.service.ts
 *
 * Purpose:
 * Contains all authentication business logic. This is the core service that handles
 * user authentication, token generation, and password management.
 *
 * Responsibilities:
 * - User registration: validates user doesn't exist, hashes password, creates user, generates tokens
 * - User login: validates credentials, generates tokens, stores refresh token hash
 * - Token refresh: validates refresh token, generates new tokens, rotates refresh token
 * - User logout: revokes refresh token in database
 * - Password reset: generates reset tokens, validates tokens, updates passwords
 * - Token generation: creates JWT access and refresh tokens with proper payloads
 *
 * How it fits into auth flow:
 * - Called by AuthController for all authentication operations
 * - Uses UsersService to interact with user database
 * - Uses JwtService to generate and sign tokens
 * - Stores refresh token hashes in database for security
 * - Returns tokens to controller (controller sets them in httpOnly cookies)
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { hash, compare } from 'bcrypt';
import { randomUUID, createHash, timingSafeEqual } from 'crypto';
import type { StringValue } from 'ms';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserEntity } from '../users/entities/user.entity';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { AuthUserCacheService } from '../common/cache/auth-user-cache.service';
import {
  UserAlreadyExistsException,
  InvalidCredentialsException,
  UserNotFoundException,
  InvalidResetTokenException,
} from '../common/exceptions';
import { AccountLockedException } from '../common/exceptions/account-locked.exception';
import { maskEmail } from '../common/utils/mask-pii.util';
import { User, Prisma, UserRole } from '@prisma/client';
import { EmailService } from '../email/email.service';

/**
 * Internal service response type that includes tokens
 * (tokens are handled by controller for HTTP concerns)
 *
 * This type represents what AuthService returns internally.
 * The controller transforms this to AuthResponseDto (without tokens) for the HTTP response.
 */
export interface AuthServiceResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  /** Pre-computed valid bcrypt hash for timing-attack mitigation when user not found */
  private dummyHash!: string;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private authUserCache: AuthUserCacheService,
    private emailService: EmailService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.dummyHash = await hash('dummy', 10);
  }

  private static readonly LOCKOUT_MAX_ATTEMPTS = 10;
  private static readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

  private normalizeEmailForLockout(email: string): string {
    return String(email).trim().toLowerCase();
  }

  private async checkLockout(email: string): Promise<void> {
    const key = this.normalizeEmailForLockout(email);
    const record = await this.prisma.loginLockout.findUnique({
      where: { email: key },
    });
    if (!record) return;
    if (record.lockedUntil && record.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((record.lockedUntil.getTime() - Date.now()) / 60000);
      throw new AccountLockedException(minutesLeft);
    }
    // Lock expired - clear so user can try again
    await this.prisma.loginLockout.deleteMany({ where: { email: key } });
  }

  private async recordFailedAttempt(email: string): Promise<void> {
    const key = this.normalizeEmailForLockout(email);
    const now = new Date();
    const lockedUntil = new Date(now.getTime() + AuthService.LOCKOUT_DURATION_MS);

    await this.prisma.loginLockout.upsert({
      where: { email: key },
      create: {
        email: key,
        attemptCount: 1,
        lockedUntil: AuthService.LOCKOUT_MAX_ATTEMPTS <= 1 ? lockedUntil : null,
      },
      update: {
        attemptCount: { increment: 1 },
        lockedUntil: undefined, // set below if needed
      },
    });

    const updated = await this.prisma.loginLockout.findUnique({
      where: { email: key },
    });
    if (updated && updated.attemptCount >= AuthService.LOCKOUT_MAX_ATTEMPTS) {
      await this.prisma.loginLockout.update({
        where: { email: key },
        data: { lockedUntil },
      });
      this.logger.warn(`Account locked: ${maskEmail(key)} after ${updated.attemptCount} failed attempts`);
    }
  }

  private async clearLockout(email: string): Promise<void> {
    const key = this.normalizeEmailForLockout(email);
    await this.prisma.loginLockout.deleteMany({ where: { email: key } });
  }

  /**
   * Registers a new user and generates authentication tokens.
   *
   * Business Logic Responsibility:
   * - Validates user doesn't already exist
   * - Hashes password
   * - Creates user in database
   * - Generates JWT tokens (access + refresh)
   * - Stores hashed refresh token in database
   *
   * Returns tokens + user (HTTP concerns like cookies handled by controller)
   */
  async register(registerDto: RegisterDto): Promise<AuthServiceResponse> {
    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) {
      throw new UserAlreadyExistsException();
    }

    const hashedPassword = await hash(registerDto.password, 10);

    // Use provided names or derive from email prefix
    const emailName = registerDto.email.split('@')[0];
    const defaultFirstName =
      emailName.charAt(0).toUpperCase() + emailName.slice(1).replace(/[._]/g, ' ');
    const firstName =
      registerDto.firstName?.trim() || defaultFirstName;
    const lastName = registerDto.lastName?.trim() ?? '';

    let user = await this.usersService.create({
      email: registerDto.email,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      role: UserRole.CUSTOMER,
    });

    const tokens = await this.generateTokens(user);
    const hashedRefreshToken = this.hashRefreshToken(tokens.refreshToken);
    const refreshExpiresAt = new Date(Date.now() + this.getRefreshExpiryMs());

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: hashedRefreshToken,
        userId: user.id,
        expiresAt: refreshExpiresAt,
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: new UserEntity(user),
    };
  }

  async validateUser(loginDto: LoginDto): Promise<User> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      // Run bcrypt compare with pre-computed hash to prevent timing attack
      await compare(loginDto.password, this.dummyHash);
      this.logger.warn(`Login failed: ${maskEmail(loginDto.email)} not found`);
      throw new InvalidCredentialsException();
    }

    const passwordValid = await compare(loginDto.password, user.passwordHash);
    if (!passwordValid) {
      this.logger.warn(`Login failed: wrong password for ${maskEmail(loginDto.email)}`);
      throw new InvalidCredentialsException();
    }

    this.logger.log(`Login success: ${user.id}`);
    return user;
  }

  /**
   * Authenticates user and generates authentication tokens.
   * Enforces account lockout after too many failed attempts.
   */
  async login(loginDto: LoginDto): Promise<AuthServiceResponse> {
    await this.checkLockout(loginDto.email);

    try {
      const user = await this.validateUser(loginDto);
      await this.clearLockout(loginDto.email);

      const tokens = await this.generateTokens(user);
      const hashedRefreshToken = this.hashRefreshToken(tokens.refreshToken);
      const refreshExpiresAt = new Date(Date.now() + this.getRefreshExpiryMs());

      await this.prisma.refreshToken.create({
        data: {
          tokenHash: hashedRefreshToken,
          userId: user.id,
          expiresAt: refreshExpiresAt,
        },
      });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: new UserEntity(user),
      };
    } catch (err) {
      if (err instanceof AccountLockedException) {
        throw err;
      }
      await this.recordFailedAttempt(loginDto.email);
      throw err;
    }
  }

  /**
   * Logs out a user by revoking the specific refresh token (by hash).
   * Other sessions (other devices/tabs) remain valid.
   */
  async logoutByRefreshToken(refreshToken: string): Promise<void> {
    if (!refreshToken) return;

    const hashed = this.hashRefreshToken(refreshToken);
    try {
      await this.prisma.refreshToken.deleteMany({
        where: { tokenHash: hashed },
      });
    } catch {
      // Swallow errors to keep logout idempotent
    }
  }

  /**
   * Refreshes authentication tokens using a valid refresh token.
   * Looks up the token in RefreshToken table (by hash), rotates to a new token,
   * and supports multiple concurrent sessions per user.
   */
  async refresh(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthServiceResponse> {
    if (!refreshTokenDto.refreshToken) {
      throw new InvalidCredentialsException('Refresh token is required');
    }

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(
        refreshTokenDto.refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );
    } catch {
      throw new InvalidCredentialsException('Invalid refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new InvalidCredentialsException('Invalid refresh token');
    }

    const hashedToken = this.hashRefreshToken(refreshTokenDto.refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashedToken },
    });

    if (!stored || stored.userId !== user.id) {
      throw new InvalidCredentialsException('Invalid refresh token');
    }

    if (stored.expiresAt <= new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: stored.id } }).catch(() => {});
      throw new InvalidCredentialsException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user);
    const newHash = this.hashRefreshToken(tokens.refreshToken);
    const refreshExpiresAt = new Date(Date.now() + this.getRefreshExpiryMs());

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    await this.prisma.refreshToken.create({
      data: {
        tokenHash: newHash,
        userId: user.id,
        expiresAt: refreshExpiresAt,
      },
    });

    return { ...tokens, user: new UserEntity(user) };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);

    // Always return the same message to prevent email enumeration
    // Only process if user exists, but don't reveal existence
    if (!user) {
      return { message: 'If an account exists, a reset link has been sent.' };
    }

    // We generate a database record first, then return a composite token:
    // `${record.id}:${rawToken}`. This allows secure lookup by token ID while
    // still storing only a bcrypt hash of the raw token.
    const rawToken = randomUUID();
    const hashedToken = await hash(rawToken, 10);

    const record = await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashedToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 15),
      },
    });

    const compositeToken = `${record.id}:${rawToken}`;
    await this.emailService.sendPasswordReset(
      user.email,
      compositeToken,
      user.firstName ?? undefined,
    );

    this.logger.log(`Password reset requested for user ${user.id}`);
    // Always return same message to prevent email enumeration
    return { message: 'If an account exists, a reset link has been sent.' };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    // Token format: `${tokenId}:${rawToken}`
    const [tokenId, rawToken] = resetPasswordDto.token.split(':');
    if (!tokenId || !rawToken) {
      throw new InvalidResetTokenException();
    }

    const record = await this.prisma.passwordResetToken.findUnique({
      where: { id: tokenId },
    });

    if (!record || record.used || record.expiresAt <= new Date()) {
      throw new InvalidResetTokenException();
    }

    const tokenMatches = await compare(rawToken, record.tokenHash);
    if (!tokenMatches) {
      throw new InvalidResetTokenException();
    }

    const hashedPassword = await hash(resetPasswordDto.password, 10);
    await this.usersService.update(record.userId, {
      passwordHash: hashedPassword,
    } as Prisma.UserUpdateInput);

    await this.prisma.refreshToken.deleteMany({
      where: { userId: record.userId },
    });

    await this.prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { used: true },
    });

    this.authUserCache.invalidate(record.userId);

    return { message: 'Password reset successful' };
  }

  async validateUserById(userId: string): Promise<UserEntity> {
    const user = await this.usersService.findByIdOrThrow(userId);
    return new UserEntity(user);
  }

  /** Hash refresh token with SHA-256 (fast, suitable for high-entropy tokens) */
  private hashRefreshToken(token: string): string {
    const digest = createHash('sha256').update(token).digest('hex');
    return `sha256:${digest}`;
  }

  /** Parse expiry string (e.g. 7d, 15m) to milliseconds for refresh token TTL */
  private getRefreshExpiryMs(): number {
    const value = this.configService.get<string>('JWT_REFRESH_EXPIRY', '7d');
    const match = /^(\d+)([smhd])$/.exec(String(value).trim());
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const [, amountStr, unit] = match;
    const amount = parseInt(amountStr, 10);
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return amount * (multipliers[unit] ?? 1000);
  }

  /** Verify refresh token against stored hash (supports legacy bcrypt and SHA-256) */
  private async verifyRefreshToken(
    token: string,
    storedHash: string,
  ): Promise<boolean> {
    if (storedHash.startsWith('sha256:')) {
      const expected = createHash('sha256').update(token).digest();
      const actual = Buffer.from(storedHash.slice(7), 'hex');
      return (
        expected.length === actual.length &&
        timingSafeEqual(expected, actual)
      );
    }
    return compare(token, storedHash);
  }

  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessExpiry = this.configService.get<string>(
      'JWT_ACCESS_EXPIRY',
      '15m',
    ) as StringValue;
    const refreshExpiry = this.configService.get<string>(
      'JWT_REFRESH_EXPIRY',
      '7d',
    ) as StringValue;

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: accessExpiry,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpiry,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Clean up used and expired password reset tokens.
   * Runs daily at 3:00 AM to prevent unbounded table growth.
   */
  @Cron('0 3 * * *')
  async cleanupPasswordResetTokens(): Promise<void> {
    const result = await this.prisma.passwordResetToken.deleteMany({
      where: {
        OR: [{ used: true }, { expiresAt: { lt: new Date() } }],
      },
    });
    if (result.count > 0) {
      this.logger.log(
        `Cleaned up ${result.count} used/expired password reset token(s)`,
      );
    }
  }

  /**
   * Clean up expired refresh tokens.
   * Runs daily at 3:30 AM to prevent unbounded table growth.
   */
  @Cron('30 3 * * *')
  async cleanupExpiredRefreshTokens(): Promise<void> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    if (result.count > 0) {
      this.logger.log(
        `Cleaned up ${result.count} expired refresh token(s)`,
      );
    }
  }
}
