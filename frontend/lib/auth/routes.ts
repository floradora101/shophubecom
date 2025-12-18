// Shared auth route helpers (edge-safe, no window usage).
// Single source of truth for protected/auth routes across middleware and client.

export const PROTECTED_PREFIXES = ["/profile", "/orders", "/admin"];

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
