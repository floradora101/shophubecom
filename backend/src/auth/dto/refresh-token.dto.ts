/**
 * RefreshTokenDto - Deprecated for web-only cookie-based auth
 *
 * Security: Refresh token is now read ONLY from httpOnly cookie.
 * Body parameter is kept for backward compatibility but will be ignored.
 * The refresh endpoint will only read from the refreshToken cookie.
 */
import { IsString, IsOptional } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsOptional()
  refreshToken?: string; // Deprecated: kept for backward compatibility, not used
}
