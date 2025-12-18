import { Injectable, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createHash } from 'crypto';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';

export interface CartContext {
  userId?: string;
  guestToken?: string;
}

@Injectable()
export class CartIdentityService {
  private readonly logger = new Logger(CartIdentityService.name);
  private readonly CART_TOKEN_COOKIE_NAME = 'cart_token';
  private readonly COOKIE_MAX_AGE_DAYS = 30;
  private readonly COOKIE_MAX_AGE_MS =
    this.COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Resolve cart context from request
   * Returns userId if authenticated, or guestToken if guest
   */
  resolveCartContext(req: Request & { user?: AuthenticatedUser }): CartContext {
    const userId = (req.user as AuthenticatedUser | undefined)?.id;
    const guestToken = this.getGuestTokenFromCookie(req);

    return {
      userId,
      guestToken,
    };
  }

  /**
   * Generate a secure random token for guest cart identification
   */
  generateGuestToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Hash a token using SHA-256
   */
  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Get guest token from cookie
   */
  getGuestTokenFromCookie(req: Request): string | undefined {
    return (req.cookies as Record<string, string> | undefined)?.[
      this.CART_TOKEN_COOKIE_NAME
    ];
  }

  /**
   * Set guest cart token cookie
   */
  setGuestTokenCookie(res: Response, token: string): void {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    res.cookie(this.CART_TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: this.COOKIE_MAX_AGE_MS,
    });
  }

  /**
   * Clear guest cart token cookie
   */
  clearGuestTokenCookie(res: Response): void {
    res.clearCookie(this.CART_TOKEN_COOKIE_NAME, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }

  /**
   * Calculate expiration date for cart session (30 days from now)
   */
  getSessionExpirationDate(): Date {
    return new Date(Date.now() + this.COOKIE_MAX_AGE_MS);
  }
}
