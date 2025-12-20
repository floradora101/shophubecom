/**
 * @file current-user.decorator.ts
 *
 * Purpose:
 * Parameter decorator that injects the authenticated user into controller methods.
 * Extracts the user object that was attached to the request by JwtStrategy.
 *
 * Responsibilities:
 * - Extracts request.user (set by JwtStrategy.validate())
 * - Provides type-safe access to authenticated user in controller methods
 * - Simplifies controller code by avoiding manual request.user access
 *
 * How it fits into auth flow:
 * - Used in controller methods protected by JwtAuthGuard
 * - JwtStrategy validates token and attaches user to request.user
 * - This decorator extracts that user and injects it as a parameter
 * - Provides type-safe access to authenticated user data
 *
 * Usage:
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * getProfile(@CurrentUser() user: AuthenticatedUser) {
 *   return user; // Type-safe authenticated user
 * }
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
