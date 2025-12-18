// Unified auth guard component for protected routes.
"use client";

import { Suspense, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "../../store/auth-store";
import type { User } from "../../lib/types/auth.types";
import { buildFullPath, buildLoginRedirect } from "../../lib/auth/routes";

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

/**
 * RequireAuth component
 *
 * Unified guard for protected routes:
 * - Checks if user is authenticated (derived from user state)
 * - Optionally checks if user has required role
 * - Redirects appropriately based on auth state
 * - Shows loading state only during initial bootstrap
 *
 * Design principles:
 * - NO checkAuth() calls on route changes (middleware handles protection)
 * - NO extra network calls - checks user state from Zustand
 * - Single source of truth: user state in Zustand store
 * - Backend is real enforcement; this is UX-only
 */
function RequireAuthContent({
  children,
  role,
  redirectTo = "/login",
  fallbackTo = "/",
}: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, hasBootstrapped, isBootstrapping } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      hasBootstrapped: state.hasBootstrapped,
      isBootstrapping: state.isBootstrapping,
    }))
  );

  // Convert searchParams to string to avoid object reference issues in dependencies
  const search = searchParams.toString();

  const isAuthenticated = !!user;

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
    // Wait for initial bootstrap to complete before making redirect decisions
    if (!hasBootstrapped) return;

    // Redirect if not authenticated
    if (!isAuthenticated) {
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
    isAuthenticated,
    hasRequiredRole,
    hasBootstrapped,
    router,
    redirectTo,
    fallbackTo,
    pathname,
    search,
  ]);

  // During initial bootstrap, show a lightweight fallback only for protected routes
  if (!hasBootstrapped && isBootstrapping) {
    return (
      <div className="flex w-full justify-center py-8">
        <p className="text-sm text-gray-500">Checking your session…</p>
      </div>
    );
  }

  // Don't render if not authenticated or missing required role (will redirect)
  if (!isAuthenticated || !hasRequiredRole) {
    return null;
  }

  return <>{children}</>;
}

export function RequireAuth(props: RequireAuthProps) {
  return (
    <Suspense
      fallback={
        <div className="flex w-full justify-center py-8">
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      }
    >
      <RequireAuthContent {...props} />
    </Suspense>
  );
}
