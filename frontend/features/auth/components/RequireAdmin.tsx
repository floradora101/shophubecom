/**
 * @file RequireAdmin.tsx
 *
 * Purpose:
 * Admin route guard component that protects admin pages. Ensures user is
 * authenticated AND has ADMIN role. Shows appropriate error states for
 * unauthorized access.
 *
 * Responsibilities:
 * - Checks if user is authenticated using Zustand store
 * - Verifies user has ADMIN role
 * - Shows loading spinner during bootstrap
 * - Redirects to login if unauthenticated
 * - Shows 403 error if authenticated but not admin
 * - Handles API errors gracefully
 *
 * Design principles:
 * - Uses state machine: status === 'unknown' | 'authenticated' | 'unauthenticated'
 * - NO bootstrap() calls - only reads state
 * - Backend is real enforcement; this is UX-only protection
 * - Consistent error handling with proper error states
 */
"use client";

import { Suspense, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/store/auth-store";
import { LoadingSpinner } from "@/components/ui/spinner";
import { buildFullPath, buildLoginRedirect } from "../routes";
import { AdminError403 } from "@/app/admin/_components/AdminError403";

interface RequireAdminProps {
  children: React.ReactNode;
  /**
   * Redirect path for unauthenticated users (defaults to /login)
   */
  redirectTo?: string;
  /**
   * Redirect path for authenticated users without admin role (defaults to /)
   */
  fallbackTo?: string;
}

function RequireAdminContent({
  children,
  redirectTo = "/login",
  fallbackTo = "/",
}: RequireAdminProps) {
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
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    // Wait for bootstrap to complete before making redirect decisions
    if (status === "unknown") return;

    // Redirect if not authenticated
    if (status === "unauthenticated") {
      const fullPath = buildFullPath(pathname, search);
      const loginPath = buildLoginRedirect(redirectTo, fullPath);
      router.replace(loginPath);
      return;
    }
  }, [status, isAuthenticated, router, redirectTo, pathname, search]);

  // During bootstrap (status === 'unknown'), show loading
  if (status === "unknown") {
    return (
      <div className="flex w-full justify-center items-center min-h-[60vh] animate-fade-in">
        <LoadingSpinner size="md" variant="inline" message="Loading…" />
      </div>
    );
  }

  // Redirect if not authenticated (will redirect via useEffect)
  if (status === "unauthenticated") {
    return null;
  }

  // Show 403 error if authenticated but not admin
  if (isAuthenticated && !isAdmin) {
    return <AdminError403 />;
  }

  return <>{children}</>;
}

export function RequireAdmin(props: RequireAdminProps) {
  return (
    <Suspense
      fallback={
        <div className="flex w-full justify-center items-center min-h-[60vh] animate-fade-in">
          <LoadingSpinner size="md" variant="inline" message="Loading…" />
        </div>
      }
    >
      <RequireAdminContent {...props} />
    </Suspense>
  );
}
