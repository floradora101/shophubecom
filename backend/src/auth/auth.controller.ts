/**
 * @module AuthController
 *
 * Purpose:
 * Handles all authentication-related HTTP endpoints.
 * This controller is intentionally thin - it only handles HTTP concerns
 * and delegates all business logic to AuthService.
 *
 * Why this file exists:
 * - To separate HTTP-level concerns from business logic (AuthService)
 * - To provide a single point of entry for all authentication operations
 * - To enforce HTTP-level validation, guards, and request handling
 *
 * Security:
 * - Per-route rate limiting (login/register: 5/min, forgot-password: 3/min, refresh: 30/min)
 * - Validates all inputs using DTOs and class-validator
 * - JWT tokens sent via httpOnly cookies (NOT in response body)
 * - Prevents XSS attacks by not storing tokens in localStorage
 * - CSRF: Using SameSite=lax cookies. If API and frontend are cross-site,
 *   must implement SameSite=None; Secure + CSRF token validation.
 */
import {
  BadRequestException,
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import type { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthResponseDto,
} from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserResponseDto } from '../users/dto';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  CSRF_TOKEN_COOKIE,
} from './constants/auth-cookies';

/**
 * Authentication Controller
 * Per-route throttling applied individually (see @Throttle decorators on routes)
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private parseDurationToMs(value: string | undefined, fallbackMs: number) {
    if (!value) return fallbackMs;
    const match = /^(\d+)([smhd])$/.exec(value.trim());
    if (!match) return fallbackMs;
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

  private parseDurationToSeconds(
    value: string | undefined,
    fallbackSeconds: number,
  ) {
    if (!value) return fallbackSeconds;
    const match = /^(\d+)([smhd])$/.exec(value.trim());
    if (!match) return fallbackSeconds;
    const [, amountStr, unit] = match;
    const amount = parseInt(amountStr, 10);
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };
    return amount * (multipliers[unit] ?? 1);
  }

  /**
   * Base cookie options for security
   * Security: httpOnly prevents JavaScript access (XSS protection)
   * secure: true in production ensures HTTPS-only transmission
   * sameSite: 'lax' provides CSRF protection for same-site requests
   * path: '/' ensures cookies are available on all routes
   * Note: If API and frontend are cross-site, use SameSite=None; Secure + CSRF token
   */
  private get cookieBaseOptions() {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: isProd, // false on localhost (http), true in production (https)
      sameSite: 'lax' as const,
      path: '/', // MUST be '/' for cookies to work on all routes
    };
  }

  /**
   * Sets authentication cookies with proper scoping
   * Both cookies use path: '/' to ensure they're available on all routes
   * Security: Both cookies are httpOnly, so JavaScript cannot access them
   */
  private setAuthCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    const accessExpiryMs = this.parseDurationToMs(
      this.configService.get<string>('JWT_ACCESS_EXPIRY'),
      15 * 60 * 1000,
    );
    const refreshExpiryMs = this.parseDurationToMs(
      this.configService.get<string>('JWT_REFRESH_EXPIRY'),
      7 * 24 * 60 * 60 * 1000,
    );

    // Access token: short expiry, available on all routes
    res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
      ...this.cookieBaseOptions,
      maxAge: accessExpiryMs,
    });

    // Refresh token: long expiry, available on all routes (needed for refresh on reload)
    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      ...this.cookieBaseOptions,
      maxAge: refreshExpiryMs,
    });
  }

  /**
   * Clears both authentication cookies
   * Security: Must clear both cookies on logout to prevent token reuse
   * Important: path/sameSite/secure/domain must match when setting cookies
   */
  private clearAuthCookies(res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE, {
      ...this.cookieBaseOptions,
    });
    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      ...this.cookieBaseOptions,
    });
  }

  /**
   * @route POST /api/auth/register
   * @description Registers a new user account and sets authentication cookies.
   *
   * @param registerDto - User registration data (email, password, firstName, lastName)
   * @returns User data only (tokens sent via httpOnly cookies)
   * @throws UserAlreadyExistsException - If email is already registered
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const response: {
      accessToken: string;
      refreshToken: string;
      user: UserResponseDto;
    } = await this.authService.register(registerDto);
    // Set tokens in httpOnly cookies
    this.setAuthCookies(res, {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });

    // Return user data only, without tokens
    const expiresIn = this.parseDurationToSeconds(
      this.configService.get<string>('JWT_ACCESS_EXPIRY'),
      15 * 60,
    );
    return {
      user: response.user,
      message: 'Registration successful',
      expiresIn,
    };
  }

  /**
   * @route POST /api/auth/login
   * @description Authenticates user with email and password.
   *
   * @param loginDto - User credentials (email, password)
   * @returns User data only (tokens sent via httpOnly cookies)
   * @throws InvalidCredentialsException - If credentials are incorrect
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const response: {
      accessToken: string;
      refreshToken: string;
      user: UserResponseDto;
    } = await this.authService.login(loginDto);
    // Set tokens in httpOnly cookies (not in response body)
    this.setAuthCookies(res, {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });

    // Return user data only, without tokens
    const expiresIn = this.parseDurationToSeconds(
      this.configService.get<string>('JWT_ACCESS_EXPIRY'),
      15 * 60,
    );
    return {
      user: response.user,
      message: 'Login successful',
      expiresIn,
    };
  }

  /**
   * @route POST /api/auth/logout
   * @description Logs out the current user by clearing authentication cookies.
   *
   * Security / enterprise behavior:
   * - Does NOT require a valid access token (no JwtAuthGuard).
   * - Always clears auth cookies, even if refresh token is missing/invalid.
   * - If a refresh token cookie is present, attempts to revoke it in the DB.
   *
   * @returns Success message
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // Mild throttling: 10 requests per minute
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as
      | string
      | undefined;

    // Always clear both cookies, regardless of refresh token presence/validity
    this.clearAuthCookies(res);

    // If we have a refresh token cookie, best-effort revoke it in the DB.
    if (refreshToken) {
      try {
        await this.authService.logoutByRefreshToken(refreshToken);
      } catch {
        // Enterprise logout should still succeed even if token is invalid/expired.
        // Errors are logged inside the service; we intentionally swallow them here.
      }
    }

    return { message: 'Logged out successfully' };
  }

  /**
   * @route POST /api/auth/refresh
   * @description Refreshes access and refresh tokens.
   *
   * Security: Refresh token MUST come from httpOnly cookie only (not from body).
   * This prevents token theft via XSS attacks.
   *
   * @param req - Request object (to read refreshToken cookie)
   * @returns User data only (new tokens sent via httpOnly cookies)
   * @throws BadRequestException - If refresh token cookie is missing
   * @throws InvalidCredentialsException - If token is invalid
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // Higher limit: 30 requests per minute (multi-tab support)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    // Security: Read refresh token ONLY from cookie (not from body)
    // This prevents XSS attacks that could intercept tokens in request body
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as
      | string
      | undefined;

    if (!refreshToken) {
      throw new BadRequestException('Refresh token is missing');
    }

    const response: {
      accessToken: string;
      refreshToken: string;
      user: UserResponseDto;
    } = await this.authService.refresh({ refreshToken });
    // Set new tokens in httpOnly cookies (not in response body)
    this.setAuthCookies(res, {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });

    // Return user data only, without tokens
    const expiresIn = this.parseDurationToSeconds(
      this.configService.get<string>('JWT_ACCESS_EXPIRY'),
      15 * 60,
    );
    return {
      user: response.user,
      message: 'Token refreshed successfully',
      expiresIn,
    };
  }

  /**
   * @route POST /api/auth/forgot-password
   * @description Initiates password reset flow.
   * Always returns same message to prevent email enumeration.
   *
   * @param forgotPasswordDto - Contains user email
   * @returns Success message (same whether email exists or not)
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // Stricter throttling: 3 requests per minute
  forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  /**
   * @route POST /api/auth/reset-password
   * @description Resets user password using reset token.
   *
   * @param resetPasswordDto - Contains token and new password
   * @returns Success message
   * @throws InvalidResetTokenException - If token is invalid or expired
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute - prevents token brute-force
  resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  /**
   * @route GET /api/auth/csrf
   * @description Returns CSRF token for cross-origin deployments.
   * Only needed when ENABLE_CSRF=true. Sets cookie and returns token in body.
   */
  @Get('csrf')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  getCsrfToken(@Res({ passthrough: true }) res: Response): { csrfToken: string } {
    const token = randomBytes(32).toString('hex');
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    res.cookie(CSRF_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    return { csrfToken: token };
  }

  /**
   * @route GET /api/auth/me
   * @description Returns the current authenticated user's profile.
   *
   * Security: Uses JwtAuthGuard which reads accessToken from httpOnly cookie.
   *
   * @param user - Current user (injected by JwtAuthGuard)
   * @param req - Request (to read accessToken cookie for actual TTL)
   * @returns User profile data and expiresIn (actual remaining seconds) for proactive token refresh
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // Mild throttling: 30 requests per minute
  getMe(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): { user: UserResponseDto; expiresIn: number } {
    const accessToken = (req as Request & { cookies?: Record<string, string> }).cookies?.[ACCESS_TOKEN_COOKIE];
    let expiresIn = this.parseDurationToSeconds(
      this.configService.get<string>('JWT_ACCESS_EXPIRY'),
      15 * 60,
    );
    if (accessToken) {
      try {
        const decoded = this.jwtService.decode(accessToken) as { exp?: number } | null;
        if (decoded?.exp) {
          const remaining = decoded.exp - Math.floor(Date.now() / 1000);
          expiresIn = Math.max(0, remaining);
        }
      } catch {
        // Fallback to config-based expiry if decode fails
      }
    }
    return {
      user: user as UserResponseDto,
      expiresIn,
    };
  }
}
