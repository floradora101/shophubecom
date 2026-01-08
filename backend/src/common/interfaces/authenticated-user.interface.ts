/**
 * Authenticated User Interface
 *
 * Represents the user object attached to the request after JWT validation.
 * This is what the JWT strategy's validate() method returns and what
 * @CurrentUser() decorator provides to controllers.
 *
 * This matches the structure returned by JwtStrategy.validate() which
 * fetches the user from the database and excludes the password field.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}
