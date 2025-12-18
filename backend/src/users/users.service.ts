import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { UserAlreadyExistsException } from '../common/exceptions/user-already-exists.exception';
import { UserNotFoundException } from '../common/exceptions/user-not-found.exception';
import { UpdateProfileDto } from './dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

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
      this.logger.error('Unexpected error creating user', error);
      throw error;
    }
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.updateUser(id, data);
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        // Record not found
        this.logger.warn(`Update failed. User not found with id: ${id}`);
        throw new UserNotFoundException();
      }
      this.logger.error('Unexpected error updating user', error);
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
        throw new BadRequestException('Email is already in use');
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
      const updated = await this.prisma.user.update({
        where: { id },
        data,
      });
      return new UserEntity(updated);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(`Email already exists: ${updateProfileDto.email}`);
        throw new BadRequestException('Email is already in use');
      }
      this.logger.error('Unexpected error updating profile', error);
      throw error;
    }
  }
}
