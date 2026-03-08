import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

export const CSRF_TOKEN_COOKIE = 'csrf_token';
export const CSRF_TOKEN_HEADER = 'x-csrf-token';

export const SKIP_CSRF_KEY = 'skipCsrf';

/**
 * CSRF Guard - validates X-CSRF-Token header for state-changing requests.
 * Only active when ENABLE_CSRF=true (for cross-origin deployments).
 * Skips validation for GET, HEAD, OPTIONS.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    if (this.configService.get<string>('ENABLE_CSRF') !== 'true') {
      return true;
    }

    const skipCsrf = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipCsrf) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method?.toUpperCase();

    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    const headerToken = request.headers[CSRF_TOKEN_HEADER] as string | undefined;
    const cookieToken = request.cookies?.[CSRF_TOKEN_COOKIE] as
      | string
      | undefined;

    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      throw new ForbiddenException('Invalid or missing CSRF token');
    }

    return true;
  }
}
