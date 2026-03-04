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
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { hash, compare } from 'bcrypt';
import { randomUUID } from 'crypto';
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
import {
  UserAlreadyExistsException,
  InvalidCredentialsException,
  UserNotFoundException,
  InvalidResetTokenException,
} from '../common/exceptions';
import { User, Prisma, UserRole } from '@prisma/client';

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
  ) {}

  async onModuleInit(): Promise<void> {
    this.dummyHash = await hash('dummy', 10);
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

    // Extract name from email if firstName/lastName not provided
    const emailName = registerDto.email.split('@')[0];
    const defaultFirstName =
      emailName.charAt(0).toUpperCase() + emailName.slice(1);
    const defaultLastName = '';

    let user = await this.usersService.create({
      email: registerDto.email,
      passwordHash: hashedPassword,
      firstName: defaultFirstName,
      lastName: defaultLastName,
      role: UserRole.CUSTOMER,
    });

    const tokens = await this.generateTokens(user);
    const hashedRefreshToken = await hash(tokens.refreshToken, 10);

    user = await this.usersService.updateUser(user.id, {
      refreshToken: hashedRefreshToken,
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
      this.logger.warn(`Login failed: ${loginDto.email} not found`);
      throw new InvalidCredentialsException();
    }

    const passwordValid = await compare(loginDto.password, user.passwordHash);
    if (!passwordValid) {
      this.logger.warn(`Login failed: wrong password for ${loginDto.email}`);
      throw new InvalidCredentialsException();
    }

    this.logger.log(`Login success: ${user.id}`);
    return user;
  }

  /**
   * Authenticates user and generates authentication tokens.
   *
   * Business Logic Responsibility:
   * - Validates user credentials
   * - Generates JWT tokens (access + refresh)
   * - Stores hashed refresh token in database
   *
   * Returns tokens + user (HTTP concerns like cookies handled by controller)
   */
  async login(loginDto: LoginDto): Promise<AuthServiceResponse> {
    const user = await this.validateUser(loginDto);
    const tokens = await this.generateTokens(user);
    const hashedRefreshToken = await hash(tokens.refreshToken, 10);

    await this.usersService.updateUser(user.id, {
      refreshToken: hashedRefreshToken,
    } as Prisma.UserUpdateInput);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: new UserEntity(user),
    };
  }

  /**
   * Logs out a user by refresh token only.
   *
   * Enterprise behavior:
   * - Verifies the refresh JWT using JWT_REFRESH_SECRET.
   * - Extracts the user ID from payload.sub.
   * - Best-effort clears the stored refreshToken in the database.
   * - Swallows verification / lookup errors to keep logout idempotent and safe.
   */
  async logoutByRefreshToken(refreshToken: string): Promise<void> {
    if (!refreshToken) return;

    let payload: JwtPayload | null = null;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
      });
    } catch {
      return;
    }

    if (!payload?.sub) {
      return;
    }

    try {
      await this.usersService.updateUser(payload.sub, {
        refreshToken: null,
      } as Prisma.UserUpdateInput);
    } catch {
      // Swallow errors to keep logout idempotent
      return;
    }
  }

  /**
   * Refreshes authentication tokens using a valid refresh token.
   *
   * Business Logic Responsibility:
   * - Validates refresh token signature and expiration
   * - Verifies refresh token matches stored hash in database
   * - Generates new JWT tokens (access + refresh)
   * - Updates stored refresh token hash in database
   *
   * Returns tokens + user (HTTP concerns like cookies handled by controller)
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
          secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
        },
      );
    } catch {
      throw new InvalidCredentialsException('Invalid refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new InvalidCredentialsException('Invalid refresh token');
    }

    const userWithRefreshToken = user as User & { refreshToken: string | null };
    if (!userWithRefreshToken.refreshToken) {
      throw new InvalidCredentialsException('Invalid refresh token');
    }

    const tokenMatches = await compare(
      refreshTokenDto.refreshToken,
      userWithRefreshToken.refreshToken,
    );
    if (!tokenMatches) {
      throw new InvalidCredentialsException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(userWithRefreshToken);
    const hashedRefreshToken = await hash(tokens.refreshToken, 10);

    await this.usersService.updateUser(userWithRefreshToken.id, {
      refreshToken: hashedRefreshToken,
    } as Prisma.UserUpdateInput);

    return { ...tokens, user: new UserEntity(userWithRefreshToken) };
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

    this.logger.log(`Password reset requested for user ${user.id}`);
    // TODO: Send email with reset link in production
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
    await this.usersService.updateUser(record.userId, {
      passwordHash: hashedPassword,
    } as Prisma.UserUpdateInput);

    await this.prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { used: true },
    });

    return { message: 'Password reset successful' };
  }

  async validateUserById(userId: string): Promise<UserEntity> {
    const user = await this.usersService.findByIdOrThrow(userId);
    return new UserEntity(user);
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
      secret: this.configService.get<string>('JWT_ACCESS_SECRET')!,
      expiresIn: accessExpiry,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
      expiresIn: refreshExpiry,
    });

    return { accessToken, refreshToken };
  }
}
