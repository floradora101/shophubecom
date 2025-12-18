/**
 * Standard response for authentication endpoints (login/register).
 *
 * Security: Tokens are sent via httpOnly cookies, not in JSON response.
 * This prevents XSS attacks that could steal tokens from localStorage.
 */
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthResponseDto {
  user!: UserResponseDto;
  message?: string;
  expiresIn?: number; // Optional: token expiration time in seconds
}
