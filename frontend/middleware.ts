/**
 * @file middleware.ts
 *
 * Purpose:
 * Next.js edge middleware that protects routes before page loads. Provides
 * first-line defense by checking for authentication cookies on protected routes.
 *
 * Responsibilities:
 * - Runs on edge (before page loads) for fast route protection
 * - Checks for accessToken or refreshToken cookie existence (not validity)
 * - Redirects to /login?redirect=/target if no cookies on protected routes
 * - Does NOT redirect away from auth pages (prevents loops with stale cookies)
 * - Excludes API routes and static assets from protection
 *
 * How it fits into auth flow:
 * - First check: runs before page loads (edge protection)
 * - If cookies exist: allows request to proceed (validity checked by backend)
 * - If no cookies: redirects to login (prevents unnecessary page loads)
 * - Cookie validity is checked by backend API (stale cookies result in 401)
 * - Axios interceptor handles 401 errors and attempts token refresh
 * - This is UX optimization; backend is the real security enforcement
 *
 * Design principles:
 * - Only checks cookie existence, not validity (backend validates)
 * - Fast edge check prevents unnecessary page loads
 * - Backend API is the source of truth for authentication
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  buildFullPath,
  buildLoginRedirect,
  isAuthPage,
  isProtectedPath,
} from "./features/auth/routes";
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Defensive check: matcher already excludes /api/*, but this provides
  // explicit early return for UploadThing routes (which handle their own auth)
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
  // Matcher excludes /api/* routes (including /api/uploadthing)
  // The negative lookahead (?!api) excludes all /api/* paths
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
