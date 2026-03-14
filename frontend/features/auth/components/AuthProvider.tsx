"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/store/auth-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { authApi } from "@/features/auth/api";
import { cartKeys } from "@/features/cart/query-keys";
import { onAuthExpired, onAuthRefreshed } from "@/lib/integrations/auth-events";
import { scheduleProactiveRefresh } from "@/features/auth/proactive-refresh";
import { USE_MOCKS } from "@/lib/flags";
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
  const { user, bootstrap, setUser } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      bootstrap: state.bootstrap,
      setUser: state.setUser,
    }))
  );

  // Fetch CSRF token and bootstrap auth ONCE on mount
  useEffect(() => {
    // Prevent double bootstraps
    if (didRunBootstrapRef.current) return;
    didRunBootstrapRef.current = true;

    if (USE_MOCKS) {
      setUser(null);
      return;
    }

    // Fetch CSRF token first (for cross-origin when ENABLE_CSRF=true)
    authApi.fetchCsrfToken().finally(() => {
      bootstrap();
    });
  }, [bootstrap, setUser]);

  // Invalidate cart when user id changes (login: null->id, logout: id->null)
  useEffect(() => {
    const currentUserId = user?.id ?? null;
    const previousUserId = previousUserIdRef.current;

    // Skip invalidation on first render (initial mount)
    if (!hasTrackedFirstRender.current) {
      hasTrackedFirstRender.current = true;
      previousUserIdRef.current = currentUserId;
      // Sync favorites on mount if user already authenticated (e.g. persisted session)
      if (currentUserId && !USE_MOCKS) {
        useFavoritesStore.getState().mergeAndSync();
      }
      return;
    }

    // Invalidate if user id changed (null->id or id->null)
    if (previousUserId !== currentUserId) {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      // Sync favorites when user becomes authenticated (login, register, bootstrap)
      if (currentUserId && !USE_MOCKS) {
        useFavoritesStore.getState().mergeAndSync();
      }
    }

    // Update ref for next comparison
    previousUserIdRef.current = currentUserId;
  }, [user?.id, queryClient]);

  // Subscribe to auth expiration events from Axios interceptor
  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      const search = searchParams.toString();
      const fullPath = buildFullPath(pathname, search);
      const onProtectedRoute = isProtectedPath(pathname);
      const onAuthRoute = isAuthPage(pathname);

      if (onProtectedRoute && !onAuthRoute) {
        const loginPath = buildLoginRedirect("/login", fullPath);
        router.replace(loginPath);
      }
    };

    const unsubscribe = onAuthExpired(handleAuthExpired);

    return unsubscribe;
  }, [setUser, pathname, searchParams, router]);

  // Reschedule proactive refresh after a successful 401-interceptor refresh.
  // Without this, a single proactive refresh failure would permanently
  // downgrade the tab to reactive-only (401-based) token renewal.
  useEffect(() => {
    if (typeof onAuthRefreshed !== "function") return;
    return onAuthRefreshed((expiresIn) => {
      scheduleProactiveRefresh(expiresIn);
    });
  }, []);

  return <>{children}</>;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <Suspense fallback={<>{children}</>}>
      <AuthProviderContent>{children}</AuthProviderContent>
    </Suspense>
  );
}
