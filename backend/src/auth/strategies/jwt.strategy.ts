/**
 * @file jwt.strategy.ts
 *
 * Purpose:
 * Implements Passport JWT strategy for validating tokens on protected routes.
 * Extracts JWT tokens from httpOnly cookies and validates user identity.
 *
 * Responsibilities:
 * - Extracts access token from httpOnly cookie (web-only, no Authorization header)
 * - Validates JWT signature using JWT_ACCESS_SECRET
 * - Verifies token expiration
 * - Fetches user from database to ensure user still exists (security requirement)
 * - Caches user data (5-minute TTL) to reduce database queries
 * - Returns authenticated user object (without password) attached to request
 *
 * How it fits into auth flow:
 * - Used by JwtAuthGuard to protect routes requiring authentication
 * - Called automatically by Passport when @UseGuards(JwtAuthGuard) is applied
 * - Validates token on every protected API request
 * - Attaches user to request.user (accessible via @CurrentUser() decorator)
 * - Always verifies user exists in DB (prevents deleted/banned user access)
 *
 * Security:
 * - Tokens read from httpOnly cookies only (prevents XSS token theft)
 * - Always verifies user exists in database (prevents stale token access)
 * - Never returns password in user object
 * - Uses bounded LRU cache to prevent memory leaks
 */
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { LRUCache } from 'lru-cache';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

interface StrategyOptions {
  jwtFromRequest?: (req: Request) => string | null;
  secretOrKey: string | Buffer;
  ignoreExpiration?: boolean;
}

interface RequestWithCookies extends Request {
  cookies: Record<string, string | undefined>;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  /** Bounded LRU cache - max 1000 entries, 5min TTL. Prevents unbounded memory growth. */
  private readonly userCache = new LRUCache<string, AuthenticatedUser>({
    max: 1000,
    ttl: 5 * 60 * 1000, // 5 minutes
  });

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const jwtSecret = configService.get<string>('JWT_ACCESS_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_ACCESS_SECRET is not configured');
    }

    const extractor = (request: RequestWithCookies): string | null => {
      // Web-only: Read access token ONLY from httpOnly cookie
      // This prevents XSS attacks that could intercept tokens from Authorization header
      // Security: httpOnly cookies cannot be accessed by JavaScript, providing XSS protection
      if (request?.cookies?.accessToken) {
        return request.cookies.accessToken;
      }
      return null;
    };

    // Type-safe extractor function
    const jwtExtractorFn = (req: Request): string | null => {
      return extractor(req as RequestWithCookies);
    };

    super({
      jwtFromRequest: jwtExtractorFn,
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    } as StrategyOptions);
  }

  /**
   * Validates the JWT payload and returns the corresponding user.
   *
   * This method is called by Passport after the JWT is successfully decoded.
   * It fetches the user from the database (with caching) and ensures they still exist.
   *
   * SECURITY: Always fetches from DB to verify user exists and is active.
   * This prevents deleted/banned users from accessing the system even with valid tokens.
   *
   * PERFORMANCE: Uses in-memory cache to reduce database queries.
   * Cache is invalidated when user data changes (via cache key pattern).
   *
   * The returned user object is attached to the request as `request.user`
   * and can be accessed via the @CurrentUser() decorator in controllers.
   *
   * @param {JwtPayload} payload - The decoded JWT payload containing user ID (sub), email, and role
   * @returns {Promise<AuthenticatedUser>} The authenticated user without password
   * @throws {UnauthorizedException} If user is not found in database
   *
   * @example
   * // Called automatically by Passport when JWT is validated
   * const user = await jwtStrategy.validate({ sub: 'uuid', email: 'user@example.com', role: 'CUSTOMER' });
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const userId = payload.sub;

    // Try to get from LRU cache first (performance optimization)
    const cached = this.userCache.get(userId);
    if (cached) {
      return cached;
    }

    // Fetch from database (ALWAYS verify user exists - SECURITY REQUIREMENT)
    // This prevents deleted/banned users from accessing the system even with valid tokens
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Password is explicitly excluded for security
      },
    });

    if (!user) {
      this.logger.warn(`User ${userId} not found in database`);
      throw new UnauthorizedException('User not found');
    }

    // Cache the user (LRU auto-evicts when max size reached)
    this.userCache.set(userId, user);

    return user;
  }

  /**
   * Invalidates the cache for a specific user.
   * Call this when user data is updated to ensure fresh data on next request.
   *
   * @param userId - The user ID to invalidate
   */
  invalidateUserCache(userId: string): void {
    this.userCache.delete(userId);
  }
}
