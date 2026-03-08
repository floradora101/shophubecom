/**
 * @file register.dto.ts
 *
 * Purpose:
 * Data Transfer Object for user registration requests. Validates and transforms
 * registration data before it reaches the AuthService.
 *
 * Responsibilities:
 * - Validates email format and normalizes to lowercase
 * - Validates password strength (min 8 chars, uppercase, lowercase, number, symbol)
 * - Transforms email to lowercase and trims whitespace
 * - Used by AuthController.register() endpoint
 *
 * How it fits into auth flow:
 * - POST /api/auth/register receives this DTO
 * - class-validator automatically validates request body
 * - If valid, passed to AuthService.register()
 * - If invalid, returns 400 Bad Request with validation errors
 */
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsStrongPassword,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @IsString()
  @MaxLength(64, { message: 'First name must not exceed 64 characters' })
  @IsOptional()
  firstName?: string;

  @IsString()
  @MaxLength(64, { message: 'Last name must not exceed 64 characters' })
  @IsOptional()
  lastName?: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
    },
  )
  password!: string;
}
