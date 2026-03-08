import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { hash, compare } from 'bcrypt';
import { UserAlreadyExistsException } from '../common/exceptions/user-already-exists.exception';
import { UserNotFoundException } from '../common/exceptions/user-not-found.exception';
import { InvalidCredentialsException } from '../common/exceptions/invalid-credentials.exception';
import { AuthUserCacheService } from '../common/cache/auth-user-cache.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService, private authUserCache: AuthUserCacheService) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    try {
      return await this.prisma.user.create({ data });
    } catch (error) {
      // Prisma unique constraint violation
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Attempt to create duplicate user with email: ${data.email}`,
        );
        throw new UserAlreadyExistsException();
      }
      // Unexpected errors bubble up
      this.logger.error(
        'Unexpected error creating user',
        (error as Error)?.stack,
      );
      throw error;
    }
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    try {
      const updated = await this.prisma.user.update({
        where: { id },
        data,
      });
      // Invalidate auth user cache when role or other sensitive fields change
      if (data.role !== undefined || data.email !== undefined) {
        this.authUserCache.invalidate(id);
      }
      return updated;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        // Record not found
        this.logger.warn(`Update failed. User not found with id: ${id}`);
        throw new UserNotFoundException();
      }
      this.logger.error(
        'Unexpected error updating user',
        (error as Error)?.stack,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async findByIdOrThrow(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateProfile(
    id: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserEntity> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new UserNotFoundException();
    }

    // Check if email is being changed and if it's already taken
    if (updateProfileDto.email && updateProfileDto.email !== existing.email) {
      const emailExists = await this.findByEmail(updateProfileDto.email);
      if (emailExists) {
        throw new UserAlreadyExistsException('Email is already in use');
      }
    }

    const data: Prisma.UserUpdateInput = {};
    if (updateProfileDto.firstName !== undefined) {
      data.firstName = updateProfileDto.firstName;
    }
    if (updateProfileDto.lastName !== undefined) {
      data.lastName = updateProfileDto.lastName;
    }
    if (updateProfileDto.email !== undefined) {
      data.email = updateProfileDto.email;
    }

    try {
      // update() invalidates auth cache when email/role changes
      const updated = await this.update(id, data);
      return new UserEntity(updated);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(`Email already exists: ${updateProfileDto.email}`);
        throw new UserAlreadyExistsException('Email is already in use');
      }
      throw error;
    }
  }

  /**
   * Changes the password for a user
   * @param id - User ID
   * @param changePasswordDto - Contains current password and new password
   * @throws InvalidCredentialsException if current password is incorrect
   * @throws UserNotFoundException if user doesn't exist
   */
  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.findByIdOrThrow(id);

    // Verify current password
    const isCurrentPasswordValid = await compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      this.logger.warn(
        `Password change failed: incorrect current password for user ${id}`,
      );
      throw new InvalidCredentialsException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await hash(changePasswordDto.newPassword, 10);

    // Update password
    try {
      await this.prisma.user.update({
        where: { id },
        data: { passwordHash: hashedNewPassword },
      });
      this.logger.log(`Password changed successfully for user ${id}`);
    } catch (error) {
      this.logger.error(
        'Unexpected error changing password',
        (error as Error)?.stack,
      );
      throw error;
    }
  }
}
