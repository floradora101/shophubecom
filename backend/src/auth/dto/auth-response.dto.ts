/**
 * @file auth-response.dto.ts
 *
 * Purpose:
 * Data Transfer Object for authentication endpoint responses (login, register, refresh).
 * Defines the structure of successful authentication responses.
 *
 * Responsibilities:
 * - Defines response structure: user data, message, expiresIn
 * - Does NOT include tokens (tokens sent via httpOnly cookies)
 * - Used by AuthController for all auth endpoints
 *
 * How it fits into auth flow:
 * - Returned by AuthController.login(), register(), refresh() endpoints
 * - Contains user data (id, email, firstName, lastName, role)
 * - Contains optional message and expiresIn (token expiration time)
 * - Tokens are set in httpOnly cookies by controller, not in response body
 *
 * Security:
 * - Tokens are sent via httpOnly cookies, not in JSON response
 * - Prevents XSS attacks that could steal tokens from localStorage
 * - User data is sanitized (no password, no sensitive fields)
 */
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthResponseDto {
  user!: UserResponseDto;
  message?: string;
  expiresIn?: number; // Optional: token expiration time in seconds
}
