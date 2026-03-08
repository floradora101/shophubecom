import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@prisma/client';

/**
 * Roles Decorator
 *
 * Sets metadata for role-based access control.
 * Use UserRole enum for type safety (e.g. @Roles(UserRole.ADMIN)).
 *
 * @param roles - One or more UserRole values
 * @example @Roles(UserRole.ADMIN) or @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
