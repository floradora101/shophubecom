/**
 * @file forgot-password.dto.ts
 *
 * Purpose:
 * Data Transfer Object for forgot password requests. Validates email address
 * for password reset initiation.
 *
 * Responsibilities:
 * - Validates email format and normalizes to lowercase
 * - Transforms email to lowercase and trims whitespace
 * - Used by AuthController.forgotPassword() endpoint
 *
 * How it fits into auth flow:
 * - POST /api/auth/forgot-password receives this DTO
 * - class-validator automatically validates request body
 * - If valid, passed to AuthService.forgotPassword()
 * - Service generates reset token and stores hash in database
 * - If invalid, returns 400 Bad Request with validation errors
 */
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;
}
