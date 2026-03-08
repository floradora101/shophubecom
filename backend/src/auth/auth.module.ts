/**
 * @file auth.module.ts
 *
 * Purpose:
 * NestJS module that configures and wires together all authentication components.
 * This is the dependency injection container for the authentication system.
 *
 * Responsibilities:
 * - Configures JwtModule with access token secret and expiry settings
 * - Registers PassportModule with JWT strategy as default
 * - Provides AuthService, AuthController, and JwtStrategy to the DI container
 * - Exports AuthService and JwtModule for use in other modules
 *
 * How it fits into auth flow:
 * - Imported by AppModule to enable authentication across the application
 * - Provides AuthController endpoints for login, register, refresh, etc.
 * - Provides JwtStrategy for validating tokens on protected routes
 * - Provides AuthService for business logic (used by AuthController)
 */
import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    EmailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        return {
          secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
          signOptions: {
            expiresIn: configService.get<string>(
              'JWT_ACCESS_EXPIRY',
            ) as StringValue,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
