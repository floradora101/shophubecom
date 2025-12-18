import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  buildFullPath,
  buildLoginRedirect,
  isAuthPage,
  isProtectedPath,
} from "./lib/auth/routes";

/**
 * Middleware for route protection
 *
 * Responsibilities:
 * - Protects routes at the edge (before page loads)
 * - Checks for accessToken cookie existence (not validity)
 * - Redirects to /login?redirect=/target if no cookie on protected routes
 * - Does NOT redirect away from auth routes (prevents loops with stale cookies)
 *
 * Design principles:
 * - Cookie validity is checked by backend API
 * - Stale/invalid cookies result in 401, handled by Axios interceptor
 * - This is edge protection only; backend is real enforcement
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // NEVER run middleware on UploadThing API routes
  // UploadThing handles its own authentication via middleware in core.ts
  if (pathname.startsWith("/api/uploadthing")) {
    return NextResponse.next();
  }

  // Never redirect away from auth pages
  if (isAuthPage(pathname)) {
    return NextResponse.next();
  }

  // Check for authentication cookies (cookie-based auth)
  // Note: httpOnly cookies are accessible in middleware via request.cookies
  // IMPORTANT: We only check for cookie existence, not validity.
  // Cookie validity is checked by the backend API. A stale/invalid cookie
  // will result in 401, which the app bootstrap (checkAuth) handles.
  const accessToken = request.cookies.get("accessToken");
  const refreshToken = request.cookies.get("refreshToken");

  // For protected routes:
  // - If accessToken exists → allow (user is authenticated)
  // - Else if refreshToken exists → allow (let app refresh on load)
  // - Else redirect to login
  if (isProtectedPath(pathname)) {
    if (!accessToken && !refreshToken) {
      const fullPath = buildFullPath(pathname, search);
      const loginPath = buildLoginRedirect("/login", fullPath);
      const loginUrl = new URL(loginPath, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Explicitly exclude /api/uploadthing and other API routes
  // The negative lookahead (?!api) already excludes /api/*, but we're explicit in code too
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
