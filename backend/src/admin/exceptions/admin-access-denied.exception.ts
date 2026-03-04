import { ForbiddenException } from '@nestjs/common';

/**
 * Exception thrown when a non-admin user attempts to access admin-only resources.
 * Returns HTTP 403 Forbidden with a clear message.
 */
export class AdminAccessDeniedException extends ForbiddenException {
  constructor(message = 'Admin access required. You do not have permission to perform this action.') {
    super({
      message,
      code: 'ADMIN_ACCESS_DENIED',
      statusCode: 403,
    });
  }
}
