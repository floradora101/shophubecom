"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "../../store/auth-store";
import { cartKeys } from "../../lib/cart/cart-keys";
import { setOnAuthExpired, clearOnAuthExpired } from "../../lib/api/authEvents";
import {
  buildFullPath,
  buildLoginRedirect,
  isAuthPage,
  isProtectedPath,
} from "../../lib/auth/routes";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider component
 *
 * Responsibilities:
 * - Initializes authentication state ONCE on app start
 * - Subscribes to auth expiration events from Axios interceptor
 * - Handles logout and redirect when auth expires
 * - Invalidates cart when auth state changes (login/logout)
 *
 * Design principles:
 * - Single source of truth: user state in Zustand store
 * - No redundant /auth/me calls on route changes
 * - Clean separation: Axios emits events, AuthProvider handles UI
 * - Centralized cart invalidation: ONLY place that invalidates cart on auth changes
 */
function AuthProviderContent({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const hasInitialized = useRef(false);
  const previousUserIdRef = useRef<string | null>(null);
  const hasTrackedFirstRender = useRef(false);
  const { user, checkAuth, clearAuth } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      checkAuth: state.checkAuth,
      clearAuth: state.clearAuth,
    }))
  );

  // Initialize auth ONCE on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeAuth = async () => {
      try {
        await checkAuth();
      } catch {
        // Auth check failed - user is not authenticated
        // This is expected for unauthenticated users
        return;
      }
    };

    initializeAuth();
  }, [checkAuth]);

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
      clearAuth();
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

    setOnAuthExpired(handleAuthExpired);

    return () => {
      clearOnAuthExpired();
    };
  }, [clearAuth, pathname, searchParams, router]);

  return <>{children}</>;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <Suspense fallback={<>{children}</>}>
      <AuthProviderContent>{children}</AuthProviderContent>
    </Suspense>
  );
}
