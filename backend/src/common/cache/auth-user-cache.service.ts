import { Injectable } from '@nestjs/common';
import { LRUCache } from 'lru-cache';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

/**
 * Shared in-memory cache for authenticated user data.
 * Used by JwtStrategy to avoid repeated DB lookups. Invalidated by
 * UsersService (on role/profile updates) and AuthService (on password reset)
 * so that permission and profile changes take effect immediately.
 */
@Injectable()
export class AuthUserCacheService {
  private readonly cache = new LRUCache<string, AuthenticatedUser>({
    max: 1000,
    ttl: 5 * 60 * 1000, // 5 minutes
  });

  get(userId: string): AuthenticatedUser | undefined {
    return this.cache.get(userId);
  }

  set(userId: string, user: AuthenticatedUser): void {
    this.cache.set(userId, user);
  }

  invalidate(userId: string): void {
    this.cache.delete(userId);
  }
}
