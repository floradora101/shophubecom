/**
 * @file routes.ts
 *
 * Purpose:
 * Utility functions for route protection and authentication routing. Provides
 * a single source of truth for protected routes, auth pages, and redirect logic.
 *
 * Responsibilities:
 * - Defines PROTECTED_PREFIXES: routes that require authentication
 * - Defines AUTH_PAGES: login and register pages
 * - isProtectedPath(): checks if a path requires authentication
 * - isAuthPage(): checks if a path is an auth page (login/register)
 * - buildFullPath(): constructs full path with query parameters
 * - buildLoginRedirect(): builds login redirect URL with return path
 *
 * How it fits into auth flow:
 * - Used by middleware.ts to check if route needs protection
 * - Used by RequireAuth to determine redirect behavior
 * - Used by AuthProvider to build redirect URLs on auth expiration
 * - Edge-safe: no window usage, works in middleware and client components
 * - Single source of truth: all route logic centralized here
 *
 * Design principles:
 * - Edge-safe: no browser APIs, works in Next.js middleware
 * - Single source of truth: route definitions in one place
 * - Reusable: used by both middleware and client components
 */

export const PROTECTED_PREFIXES = ["/profile", "/orders"];

export const AUTH_PAGES = ["/login", "/register"];

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some((page) => pathname === page);
}

export function buildFullPath(pathname: string, search: string): string {
  return search ? `${pathname}?${search}` : pathname;
}

export function buildLoginRedirect(
  redirectTo: string,
  fullPath: string
): string {
  const base = redirectTo || "/login";
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}redirect=${encodeURIComponent(fullPath)}`;
}
