/**
 * @file auth-store.ts
 *
 * Purpose:
 * Zustand store that manages authentication state and user session. This is the
 * single source of truth for authentication state in the frontend application.
 *
 * Responsibilities:
 * - Manages auth state machine: status = 'unknown' | 'authenticated' | 'unauthenticated'
 * - Stores user data (null when unauthenticated)
 * - Provides bootstrap() to initialize auth state on app load
 * - Provides login(), register(), logout() actions
 * - Persists only status to localStorage (not user/role) for defense-in-depth
 * - Prevents double bootstraps with bootstrapped flag
 *
 * How it fits into auth flow:
 * - Called by AuthProvider on app mount to bootstrap auth state
 * - Called by LoginForm/RegisterForm to authenticate users
 * - Called by AuthProvider when auth expires (clears state)
 * - Read by RequireAuth to check authentication status
 * - Tokens are stored in httpOnly cookies (not in this store)
 * - Only status is persisted; user is always refetched on bootstrap (avoids persisting role)
 *
 * State Machine:
 * - 'unknown': Initial state, bootstrap not yet completed
 * - 'authenticated': User is logged in, user data available
 * - 'unauthenticated': User is not logged in, user is null
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authApi } from "@/features/auth/api";
import {
  scheduleProactiveRefresh,
  cancelProactiveRefresh,
} from "@/features/auth/proactive-refresh";
import { extractErrorInfo } from "@/lib/api/error-handler";
import { logError } from "@/lib/errors/logger";
import type {
  User,
  LoginFormData,
  RegisterFormData,
} from "@/features/auth/types";

type AuthStatus = "unknown" | "authenticated" | "unauthenticated";

interface AuthState {
  // State machine: explicit auth status
  status: AuthStatus;
  // User data (null when unauthenticated)
  user: User | null;
  // Whether bootstrap has completed (prevents double bootstraps)
  bootstrapped: boolean;
  // Actions
  bootstrap: () => Promise<void>;
  setUser: (user: User | null) => void;
  login: (data: LoginFormData) => Promise<User>;
  register: (data: RegisterFormData) => Promise<User>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state: unknown until bootstrap completes
      status: "unknown",
      user: null,
      bootstrapped: false,

      /**
       * Bootstrap authentication state
       * Calls /auth/me once to determine auth status
       * On 200 → user=..., status='authenticated', bootstrapped=true
       * On 401 → user=null, status='unauthenticated', bootstrapped=true
       * Never leaves app in "half logged in" state
       */
      bootstrap: async () => {
        // Prevent double bootstraps
        if (get().bootstrapped) {
          return;
        }

        try {
          const authData = await authApi.getMe();
          set({
            user: authData.user,
            status: "authenticated",
            bootstrapped: true,
          });
          if (authData.expiresIn) {
            scheduleProactiveRefresh(authData.expiresIn);
          }
        } catch (error: unknown) {
          // getMe() failed - user is not authenticated
          // Note: Interceptor may have attempted refresh automatically.
          // If refresh succeeded, getMe() would have succeeded on retry.
          // If we're here, either:
          // 1. No refresh token available (guest user)
          // 2. Refresh token invalid/expired
          // 3. Refresh failed for other reasons
          // In all cases, user should be treated as unauthenticated
          // Log non-auth errors (e.g. server/network) for debugging
          const info = extractErrorInfo(error);
          if (!info.isAuthError) {
            logError(error, { component: "AuthStore", action: "bootstrap" });
          }
          set({
            user: null,
            status: "unauthenticated",
            bootstrapped: true,
          });
        }
      },

      /**
       * Set user state (used after login/register)
       * Updates both user and status
       */
      setUser: (user: User | null) => {
        if (!user) cancelProactiveRefresh();
        set({
          user,
          status: user ? "authenticated" : "unauthenticated",
        });
      },

      /**
       * Login user with email and password
       * Security: Tokens are stored in httpOnly cookies by backend (not accessible to JS)
       * We only store user data in localStorage for UI state
       * Returns user data for form components to use
       */
      login: async (data: LoginFormData): Promise<User> => {
        const authData = await authApi.login(data);
        const user = authData.user;
        set({
          user,
          status: "authenticated",
        });
        if (authData.expiresIn) {
          scheduleProactiveRefresh(authData.expiresIn);
        }
        return user;
      },

      /**
       * Register new user
       * Security: Tokens are stored in httpOnly cookies by backend (not accessible to JS)
       * We only store user data in localStorage for UI state
       * Returns user data for form components to use
       */
      register: async (data: RegisterFormData): Promise<User> => {
        const authData = await authApi.register(data);
        const user = authData.user;
        set({
          user,
          status: "authenticated",
        });
        if (authData.expiresIn) {
          scheduleProactiveRefresh(authData.expiresIn);
        }
        return user;
      },

      /**
       * Logout user
       * Clears tokens on server and local state
       * Calls API then clears state
       */
      logout: async () => {
        cancelProactiveRefresh();
        try {
          await authApi.logout();
        } catch (error) {
          // Continue with local logout even if API call fails
        } finally {
          set({
            user: null,
            status: "unauthenticated",
          });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // Persist only status (not user/role) - user is refetched on bootstrap (#13)
      partialize: (state: AuthState) => ({
        status: state.status,
      }),
      // After rehydration, force unknown + re-bootstrap so we never show stale auth (#16)
      merge: (_persistedState, currentState) => ({
        ...currentState,
        status: "unknown" as const,
        bootstrapped: false,
        user: null,
      }),
      // Sync auth state across tabs: when another tab logs out, clear local state
      onRehydrateStorage: () => (state) => {
        if (typeof window === "undefined") return;
        const handleStorage = (e: StorageEvent) => {
          if (e.key !== "auth-storage") return;
          const newState = e.newValue ? (JSON.parse(e.newValue) as { state?: { status?: string } }) : null;
          const currentUser = useAuthStore.getState().user;
          if (newState?.state?.status === "unauthenticated" && currentUser) {
            useAuthStore.getState().setUser(null);
          }
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
      },
    }
  )
);

// Selector helpers to minimize subscriptions in components
export const selectAuthStatus = (state: AuthState) => ({
  status: state.status,
  isAuthenticated: state.status === "authenticated",
  bootstrapped: state.bootstrapped,
});

export const selectAuthUser = (state: AuthState) => state.user;

export const selectAuthActions = (state: AuthState) => ({
  bootstrap: state.bootstrap,
  setUser: state.setUser,
  login: state.login,
  register: state.register,
  logout: state.logout,
});
