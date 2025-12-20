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
 * - Persists user and status to localStorage (tokens are in httpOnly cookies)
 * - Prevents double bootstraps with bootstrapped flag
 *
 * How it fits into auth flow:
 * - Called by AuthProvider on app mount to bootstrap auth state
 * - Called by LoginForm/RegisterForm to authenticate users
 * - Called by AuthProvider when auth expires (clears state)
 * - Read by RequireAuth to check authentication status
 * - Tokens are stored in httpOnly cookies (not in this store)
 * - Only user data and status are stored here for UI state
 *
 * State Machine:
 * - 'unknown': Initial state, bootstrap not yet completed
 * - 'authenticated': User is logged in, user data available
 * - 'unauthenticated': User is not logged in, user is null
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authApi } from "@/features/auth/api";
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
          const user = await authApi.getMe();
          set({
            user,
            status: "authenticated",
            bootstrapped: true,
          });
        } catch (error: unknown) {
          // getMe() failed - user is not authenticated
          // Note: Interceptor may have attempted refresh automatically.
          // If refresh succeeded, getMe() would have succeeded on retry.
          // If we're here, either:
          // 1. No refresh token available (guest user)
          // 2. Refresh token invalid/expired
          // 3. Refresh failed for other reasons
          // In all cases, user should be treated as unauthenticated
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
        // Backend sets tokens in httpOnly cookies automatically
        // Response only contains user data (no tokens)
        const user = authData.user;
        set({
          user,
          status: "authenticated",
        });
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
        // Backend sets tokens in httpOnly cookies automatically
        // Response only contains user data (no tokens)
        const user = authData.user;
        set({
          user,
          status: "authenticated",
        });
        return user;
      },

      /**
       * Logout user
       * Clears tokens on server and local state
       * Calls API then clears state
       */
      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          // Continue with local logout even if API call fails
        } finally {
          // Always clear local state
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
      // Only persist durable data: user and status
      // Do NOT persist: error, isSubmitting, isBootstrapping, hadSession, timestamps
      partialize: (state: AuthState) => ({
        user: state.user,
        status: state.status,
      }),
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
