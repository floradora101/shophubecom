/**
 * @file login.dto.ts
 *
 * Purpose:
 * Data Transfer Object for user login requests. Validates and transforms
 * login credentials before they reach the AuthService.
 *
 * Responsibilities:
 * - Validates email format and normalizes to lowercase
 * - Validates password is provided (not empty)
 * - Transforms email to lowercase and trims whitespace
 * - Used by AuthController.login() endpoint
 *
 * How it fits into auth flow:
 * - POST /api/auth/login receives this DTO
 * - class-validator automatically validates request body
 * - If valid, passed to AuthService.login()
 * - If invalid, returns 400 Bad Request with validation errors
 */
import { Transform } from 'class-transformer';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}
