/**
 * @file reset-password.dto.ts
 *
 * Purpose:
 * Data Transfer Object for password reset requests. Validates reset token and
 * new password for password reset completion.
 *
 * Responsibilities:
 * - Validates reset token is provided (not empty)
 * - Validates password strength (min 8 chars, uppercase, lowercase, number, symbol)
 * - Used by AuthController.resetPassword() endpoint
 *
 * How it fits into auth flow:
 * - POST /api/auth/reset-password receives this DTO
 * - class-validator automatically validates request body
 * - If valid, passed to AuthService.resetPassword()
 * - Service validates token, updates password, marks token as used
 * - If invalid, returns 400 Bad Request with validation errors
 */
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsStrongPassword,
} from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
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
