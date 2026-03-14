import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const allowed = requiredRoles.some((role) => user?.role === role);

    if (!allowed) {
      this.logger.warn(
        `Access denied: ${request.method} ${request.url} | ` +
        `required=[${requiredRoles}] actual=${user?.role ?? 'NO_USER'} ` +
        `userId=${user?.id ?? 'N/A'}`,
      );
    }

    return allowed;
  }
}
