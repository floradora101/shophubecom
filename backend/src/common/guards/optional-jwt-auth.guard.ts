import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Optional JWT Auth Guard
 *
 * Similar to JwtAuthGuard but does NOT throw on missing/invalid token.
 * - If token is valid: sets req.user with authenticated user
 * - If token is missing/invalid: proceeds as guest (req.user is undefined)
 *
 * Use this for endpoints that should work for both authenticated users and guests.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Override canActivate to catch errors and allow guest access
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Try to activate the JWT guard
    // If it succeeds, user is authenticated (req.user is set)
    // If it fails, we catch and allow guest access
    const result = super.canActivate(context);

    // If result is a Promise, catch errors and allow guest access
    if (result instanceof Promise) {
      return result.catch((err) => {
        // Token missing, invalid, or expired - allow as guest
        // Don't log or throw - this is expected for guest access
        return true;
      });
    }

    // If result is Observable, handle it
    if (result instanceof Observable) {
      return result.pipe(
        // On error, return true to allow guest access
        catchError(() => of(true)),
      );
    }

    // If result is boolean, return as-is
    return result;
  }

  /**
   * Override handleRequest to not throw on errors
   * This ensures missing/invalid tokens don't cause 401 responses
   *
   * This method is called by Passport after authentication attempt.
   * We return undefined (guest) instead of throwing for any auth errors.
   */
  handleRequest(err: any, user: any, info: any) {
    // Always allow guest access if there's an error or no user
    // This prevents 401 responses for guest requests with invalid/expired tokens
    if (err || !user) {
      return undefined;
    }
    return user;
  }
}
