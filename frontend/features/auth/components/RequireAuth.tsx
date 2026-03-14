/**
 * @file RequireAuth.tsx
 *
 * Purpose:
 * Route guard component that protects pages requiring authentication. Wraps
 * protected content and redirects unauthenticated users to login.
 *
 * Responsibilities:
 * - Checks if user is authenticated using Zustand store state machine
 * - Optionally checks if user has required role(s)
 * - Shows loading spinner during bootstrap (status === 'unknown')
 * - Redirects to login if unauthenticated
 * - Redirects to fallback route if authenticated but missing required role
 * - Never calls bootstrap() - only reads state (bootstrap handled by AuthProvider)
 *
 * How it fits into auth flow:
 * - Wraps protected page components (e.g., <RequireAuth><ProfilePage /></RequireAuth>)
 * - Reads auth status from Zustand store (no API calls)
 * - During bootstrap (status === 'unknown'): shows loading spinner
 * - If unauthenticated: redirects to /login?redirect=/current-path
 * - If authenticated: renders children
 * - If role required but missing: redirects to fallback route
 *
 * Design principles:
 * - Uses state machine: status === 'unknown' | 'authenticated' | 'unauthenticated'
 * - NO bootstrap() calls - only reads state (prevents redundant API calls)
 * - NO extra network calls - middleware handles edge protection
 * - Backend is real enforcement; this is UX-only protection
 * - Single source of truth: Zustand store state
 */
"use client";

import { Suspense, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/store/auth-store";
import { LoadingSpinner } from "@/components/ui/spinner";
import type { User } from "../types";
import { buildFullPath, buildLoginRedirect } from "../routes";

interface RequireAuthProps {
  children: React.ReactNode;
  /**
   * Required role(s). If provided, user must have one of these roles.
   * If not provided, any authenticated user can access.
   */
  role?: User["role"] | User["role"][];
  /**
   * Redirect path for unauthenticated users (defaults to /login)
   */
  redirectTo?: string;
  /**
   * Redirect path for authenticated users without required role (defaults to /)
   */
  fallbackTo?: string;
}
function RequireAuthContent({
  children,
  role,
  redirectTo = "/login",
  fallbackTo = "/",
}: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status, user } = useAuthStore(
    useShallow((state) => ({
      status: state.status,
      user: state.user,
    }))
  );

  // Convert searchParams to string to avoid object reference issues in dependencies
  const search = searchParams.toString();

  const isAuthenticated = status === "authenticated";

  // Handle role check safely: if userRole is undefined, role check should fail
  const hasRequiredRole = role
    ? (() => {
        const userRole = user?.role;
        // If userRole is undefined, role check fails
        if (userRole === undefined) return false;
        // Support both single role and array of roles using proper typing
        return Array.isArray(role)
          ? role.includes(userRole)
          : userRole === role;
      })()
    : true;

  useEffect(() => {
    // Wait for bootstrap to complete before making redirect decisions
    // status === 'unknown' means bootstrap hasn't completed yet
    if (status === "unknown") return;

    // Redirect if not authenticated
    if (status === "unauthenticated") {
      const fullPath = buildFullPath(pathname, search);
      const loginPath = buildLoginRedirect(redirectTo, fullPath);
      // Use replace to avoid back-button loops
      router.replace(loginPath);
      return;
    }

    // Redirect if authenticated but doesn't have required role
    if (isAuthenticated && !hasRequiredRole) {
      // Use replace to avoid back-button loops
      router.replace(fallbackTo);
      return;
    }
  }, [
    status,
    isAuthenticated,
    hasRequiredRole,
    router,
    redirectTo,
    fallbackTo,
    pathname,
    search,
  ]);

  // During bootstrap (status === 'unknown'), show loading
  // This removes redirect flicker and "false unauthenticated" during hydration
  if (status === "unknown") {
    return (
      <div className="flex w-full justify-center py-8 animate-fade-in">
        <LoadingSpinner size="md" variant="inline" message="Loading…" />
      </div>
    );
  }

  // Don't render if not authenticated or missing required role (will redirect)
  if (status === "unauthenticated" || !hasRequiredRole) {
    return null;
  }

  return <>{children}</>;
}

export function RequireAuth(props: RequireAuthProps) {
  return (
    <Suspense
      fallback={
        <div className="flex w-full justify-center py-8 animate-fade-in">
          <LoadingSpinner size="md" variant="inline" message="Loading…" />
        </div>
      }
    >
      <RequireAuthContent {...props} />
    </Suspense>
  );
}
