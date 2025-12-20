/**
 * @file jwt-auth.guard.ts
 *
 * Purpose:
 * NestJS guard that protects routes requiring authentication. Uses Passport's
 * JWT strategy to validate requests before allowing access to protected endpoints.
 *
 * Responsibilities:
 * - Intercepts requests to protected routes
 * - Validates JWT token using JwtStrategy
 * - Blocks unauthenticated requests (returns 401 Unauthorized)
 * - Allows authenticated requests to proceed to controller
 *
 * How it fits into auth flow:
 * - Applied via @UseGuards(JwtAuthGuard) decorator on controller routes
 * - Automatically calls JwtStrategy.validate() to authenticate requests
 * - Used on protected endpoints like GET /auth/me, POST /orders, etc.
 * - If token is valid, request proceeds; if invalid, returns 401
 *
 * Usage:
 * @UseGuards(JwtAuthGuard)
 * @Get('me')
 * getMe(@CurrentUser() user: AuthenticatedUser) { ... }
 */
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }
}
