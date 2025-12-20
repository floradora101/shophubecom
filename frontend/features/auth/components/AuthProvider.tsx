"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/store/auth-store";
import { cartKeys } from "@/features/cart/query-keys";
import { onAuthExpired } from "@/lib/integrations/auth-events";
import {
  buildFullPath,
  buildLoginRedirect,
  isAuthPage,
  isProtectedPath,
} from "../routes";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * @file AuthProvider.tsx
 *
 * Purpose:
 * React component that initializes and manages authentication state for the application.
 * Wraps the app and handles auth bootstrap, expiration events, and cart invalidation.
 *
 * Responsibilities:
 * - Calls bootstrap() once on mount to initialize auth state (with ref guard)
 * - Subscribes to authExpired events from Axios interceptor
 * - Handles logout and redirect when auth expires
 * - Invalidates cart queries when user ID changes (login/logout)
 * - Prevents double bootstraps with didRunBootstrapRef guard
 *
 * How it fits into auth flow:
 * - Mounts once at app root (in AppProviders)
 * - On mount: calls authStore.bootstrap() to check auth status
 * - Subscribes to authExpired events: when Axios refresh fails, clears state and redirects
 * - Monitors user.id changes: invalidates cart when user logs in/out
 * - Single source of truth: uses Zustand store for auth state
 *
 * Design principles:
 * - One bootstrap call per app load (guarded against React strict mode double-mount)
 * - Clean separation: Axios emits events, AuthProvider handles UI
 * - Centralized cart invalidation: ONLY place that invalidates cart on auth changes
 * - No direct API calls: delegates to auth-store for all auth operations
 */
function AuthProviderContent({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const previousUserIdRef = useRef<string | null>(null);
  const hasTrackedFirstRender = useRef(false);
  const didRunBootstrapRef = useRef(false);
  const { user, bootstrap, setUser, logout } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      bootstrap: state.bootstrap,
      setUser: state.setUser,
      logout: state.logout,
    }))
  );

  // Bootstrap auth ONCE on mount
  useEffect(() => {
    // Prevent double bootstraps
    if (didRunBootstrapRef.current) return;
    didRunBootstrapRef.current = true;

    bootstrap();
  }, [bootstrap]);

  // Invalidate cart when user id changes (login: null->id, logout: id->null)
  useEffect(() => {
    const currentUserId = user?.id ?? null;
    const previousUserId = previousUserIdRef.current;

    // Skip invalidation on first render (initial mount)
    if (!hasTrackedFirstRender.current) {
      hasTrackedFirstRender.current = true;
      previousUserIdRef.current = currentUserId;
      return;
    }

    // Invalidate if user id changed (null->id or id->null)
    if (previousUserId !== currentUserId) {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    }

    // Update ref for next comparison
    previousUserIdRef.current = currentUserId;
  }, [user?.id, queryClient]);

  // Subscribe to auth expiration events from Axios interceptor
  useEffect(() => {
    const handleAuthExpired = () => {
      // Clear auth state (no API call if cookies already invalid)
      setUser(null);
      // Only redirect to login if we're on a protected route
      // Public routes (homepage, products, cart) should remain accessible
      const search = searchParams.toString();
      const fullPath = buildFullPath(pathname, search);
      const onProtectedRoute = isProtectedPath(pathname);
      const onAuthRoute = isAuthPage(pathname);

      // Only redirect if on a protected route and not already on auth page
      if (onProtectedRoute && !onAuthRoute) {
        const loginPath = buildLoginRedirect("/login", fullPath);
        // Use replace to avoid adding to history stack
        router.replace(loginPath);
      }
      // If on public route, just clear auth state - don't redirect
    };

    const unsubscribe = onAuthExpired(handleAuthExpired);

    return unsubscribe;
  }, [setUser, pathname, searchParams, router]);

  return <>{children}</>;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <Suspense fallback={<>{children}</>}>
      <AuthProviderContent>{children}</AuthProviderContent>
    </Suspense>
  );
}
