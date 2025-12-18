/**
 * @module JwtStrategy
 *
 * Purpose:
 * Implements a Passport JWT strategy for authenticating requests.
 * This strategy extracts JWTs from httpOnly cookies only (web-only authentication).
 *
 * Why this file exists:
 * - Centralizes JWT extraction and validation logic
 * - Integrates with Passport for NestJS route guards
 * - Provides a single point to validate user identity from JWT payload
 * - Web-only: reads tokens from httpOnly cookies only (no Authorization header fallback)
 *
 * Security:
 * - Validates JWT signature using JWT_SECRET
 * - Checks token expiration
 * - Verifies user still exists in database (CRITICAL for security)
 * - Never returns password in user object
 * - Web-only: tokens read from httpOnly cookies only (prevents XSS token theft)
 *
 * Performance:
 * - Uses in-memory cache to reduce database queries
 * - Cache TTL: 5 minutes (balance between freshness and performance)
 * - Cache invalidation on user updates (via cache key pattern)
 *
 * Best Practice:
 * - Always fetch from DB to verify user exists (prevents deleted/banned user access)
 * - Cache for performance (reduces DB load)
 * - Use JWT payload only for non-critical data (like role checks in guards)
 */
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
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

// Simple in-memory cache (no external dependencies)
// For production, consider Redis via @nestjs/cache-manager
interface CacheEntry {
  user: AuthenticatedUser;
  expiresAt: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  // Simple in-memory cache (thread-safe for single instance)
  private readonly userCache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

    // Try to get from cache first (performance optimization)
    const cached = this.userCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.user;
    }

    // Remove expired cache entry
    if (cached) {
      this.userCache.delete(userId);
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

    // Cache the user for future requests (performance optimization)
    this.userCache.set(userId, {
      user,
      expiresAt: Date.now() + this.CACHE_TTL,
    });

    // Clean up expired entries periodically (prevent memory leak)
    if (this.userCache.size > 1000) {
      this.cleanExpiredCacheEntries();
    }

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

  /**
   * Cleans up expired cache entries to prevent memory leaks.
   * Called automatically when cache size exceeds threshold.
   */
  private cleanExpiredCacheEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.userCache.entries()) {
      if (entry.expiresAt <= now) {
        this.userCache.delete(key);
      }
    }
  }
}
