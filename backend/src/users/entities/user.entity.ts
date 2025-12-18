import { Exclude } from 'class-transformer';
import { User, UserRole } from '@prisma/client';

/**
 * User entity for API responses.
 * Automatically excludes password field when serialized via ClassSerializerInterceptor.
 */
export class UserEntity {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  role!: UserRole;
  createdAt!: Date;
  updatedAt!: Date;

  @Exclude()
  passwordHash!: string;

  @Exclude()
  refreshToken!: string | null;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
