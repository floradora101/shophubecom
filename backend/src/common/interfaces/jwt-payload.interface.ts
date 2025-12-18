/**
 * JWT Payload Interface
 *
 * Defines the structure of the JWT token payload used for authentication.
 * This interface ensures type safety when working with JWT tokens.
 */
export interface JwtPayload {
  sub: string;

  email: string;

  role: 'CUSTOMER' | 'ADMIN';

  iat?: number;

  exp?: number;
}
