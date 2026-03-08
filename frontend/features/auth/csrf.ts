/**
 * CSRF token storage - extracted to avoid circular dependency.
 * client.ts imports getCsrfToken; auth/api must not pull in request (which uses client).
 */
let csrfToken: string | null = null;

export function getCsrfToken(): string | null {
  return csrfToken;
}

export function setCsrfToken(token: string | null): void {
  csrfToken = token;
}
