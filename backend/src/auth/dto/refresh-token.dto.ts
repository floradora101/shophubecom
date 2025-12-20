/**
 * @file refresh-token.dto.ts
 *
 * Purpose:
 * Data Transfer Object for token refresh requests. Note: refresh token is now
 * read ONLY from httpOnly cookie for security (web-only authentication).
 *
 * Responsibilities:
 * - Defines DTO structure (for backward compatibility)
 * - refreshToken field is optional and deprecated (not used)
 * - Used by AuthController.refresh() endpoint
 *
 * How it fits into auth flow:
 * - POST /api/auth/refresh receives this DTO (but ignores body)
 * - Refresh token is read from httpOnly cookie (not request body)
 * - If valid cookie, passed to AuthService.refresh()
 * - Service validates token, generates new tokens, sets in cookies
 * - If invalid, returns 401 Unauthorized
 *
 * Security:
 * - Refresh token read ONLY from httpOnly cookie (prevents XSS token theft)
 * - Body parameter kept for backward compatibility but ignored
 * - This ensures tokens cannot be intercepted from request body
 */
import { IsString, IsOptional } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsOptional()
  refreshToken?: string; // Deprecated: kept for backward compatibility, not used
}
