import { SetMetadata } from '@nestjs/common';

/**
 * Roles Decorator
 *
 * Sets metadata for role-based access control.
 * Accepts string roles or UserRole enum values.
 * UserRole enum values are strings ('ADMIN', 'CUSTOMER'), so this works seamlessly.
 *
 * @param roles - Array of role strings or UserRole enum values
 * @example @Roles('ADMIN') or @Roles(UserRole.ADMIN)
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
