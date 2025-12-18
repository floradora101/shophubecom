// Zustand store for authentication state and user session.
// Single source of truth: authentication is derived from user only.
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authApi } from "../lib/api/auth";
import { extractErrorMessage } from "../lib/utils/error-handler";
import type {
  User,
  LoginFormData,
  RegisterFormData,
} from "../lib/types/auth.types";

interface AuthState {
  // Single source of truth: user is the only persisted auth state
  user: User | null;
  // Track if we had a session (for refresh logic)
  hadSession: boolean;
  // Split loading states: auth bootstrap vs form submissions
  hasBootstrapped: boolean;
  isBootstrapping: boolean;
  isSubmitting: boolean;
  error: string | null;
  // Actions
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      hadSession: false,
      // Start in bootstrapping state so protected guards can wait for first check
      // and/or rehydrated persisted user from localStorage.
      hasBootstrapped: false,
      isBootstrapping: true,
      isSubmitting: false,
      error: null,

      /**
       * Clear authentication state
       * Called when auth expires or user logs out
       */
      clearAuth: () => {
        set({
          user: null,
          hadSession: false,
          error: null,
        });
      },

      /**
       * Login user with email and password
       *
       * Security: Tokens are stored in httpOnly cookies by backend (not accessible to JS)
       * We only store user data in localStorage for UI state
       */
      login: async (data: LoginFormData) => {
        set({ isSubmitting: true, error: null });
        try {
          const authData = await authApi.login(data);
          // Backend sets tokens in httpOnly cookies automatically
          // Response only contains user data (no tokens)
          set({
            user: authData.user,
            hadSession: true,
            isSubmitting: false,
            error: null,
          });
        } catch (error: unknown) {
          set({
            isSubmitting: false,
            error: extractErrorMessage(error) || "Login failed",
            user: null,
            hadSession: false,
          });
          throw error;
        }
      },

      /**
       * Register new user
       *
       * Security: Tokens are stored in httpOnly cookies by backend (not accessible to JS)
       * We only store user data in localStorage for UI state
       */
      register: async (data: RegisterFormData) => {
        set({ isSubmitting: true, error: null });
        try {
          const authData = await authApi.register(data);
          // Backend sets tokens in httpOnly cookies automatically
          // Response only contains user data (no tokens)
          set({
            user: authData.user,
            hadSession: true,
            isSubmitting: false,
            error: null,
          });
        } catch (error: unknown) {
          set({
            isSubmitting: false,
            error: extractErrorMessage(error) || "Registration failed",
            user: null,
            hadSession: false,
          });
          throw error;
        }
      },

      /**
       * Logout user
       * Clears tokens on server and local state
       */
      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          // Log error but continue with local logout
          console.error("Logout API call failed:", error);
        } finally {
          // Always clear local state
          get().clearAuth();
        }
      },

      /**
       * Check if user is authenticated by calling /auth/me
       * If 401, attempts to refresh token, then calls /auth/me again
       * This ensures refresh works on reload and protected route navigation
       *
       * Flow:
       * 1. Call /auth/me
       * 2. If 401 → call /auth/refresh
       * 3. If refresh ok → call /auth/me again
       * 4. Set user state accordingly
       *
       * Note: checkAuth owns bootstrap state and does not touch error state
       * Important: Do NOT treat /auth/me 401 as an "error UI". It's normal.
       */
      checkAuth: async () => {
        const isFirstBootstrap = !get().hasBootstrapped;
        if (isFirstBootstrap) {
          set({ isBootstrapping: true });
        }
        try {
          // Step 1: Try to get current user
          const user = await authApi.getMe();
          set({
            user,
            hadSession: true,
            hasBootstrapped: true,
          });
        } catch (error: unknown) {
          // Step 2: If /auth/me returns 401, try to refresh
          // Check if it's a 401 error (unauthorized - token expired)
          const isAxiosError =
            error && typeof error === "object" && "response" in error;
          const status =
            isAxiosError &&
            "response" in error &&
            error.response &&
            typeof error.response === "object" &&
            "status" in error.response
              ? (error.response as { status: number }).status
              : null;

          if (status === 401) {
            try {
              // Step 3: Attempt to refresh token
              await authApi.refresh();
              // Step 4: If refresh succeeded, try /auth/me again
              try {
                const user = await authApi.getMe();
                set({
                  user,
                  hadSession: true,
                  hasBootstrapped: true,
                });
              } catch {
                // Refresh succeeded but /auth/me still failed - user is not authenticated
                set({
                  user: null,
                  hasBootstrapped: true,
                });
              }
            } catch {
              // Refresh failed - user is not authenticated
              // This is expected for unauthenticated users
              set({
                user: null,
                hasBootstrapped: true,
              });
            }
          } else {
            // Other error (not 401) - user is not authenticated
            set({
              user: null,
              hasBootstrapped: true,
            });
          }
        } finally {
          if (isFirstBootstrap) {
            set({ isBootstrapping: false });
          }
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist user data and hadSession flag, not tokens (tokens are in httpOnly cookies)
      // isAuthenticated is derived from user, so we don't persist it
      partialize: (state: AuthState) => ({
        user: state.user,
        hadSession: state.hadSession,
      }),
    }
  )
);

// Helper to derive isAuthenticated from user (single source of truth)
const getIsAuthenticated = (state: AuthState): boolean => !!state.user;

// Selector helpers to minimize subscriptions in components
export const selectAuthStatus = (state: AuthState) => ({
  isAuthenticated: getIsAuthenticated(state),
  hasBootstrapped: state.hasBootstrapped,
  isBootstrapping: state.isBootstrapping,
  isSubmitting: state.isSubmitting,
});

export const selectAuthUser = (state: AuthState) => state.user;

export const selectAuthActions = (state: AuthState) => ({
  login: state.login,
  register: state.register,
  logout: state.logout,
  checkAuth: state.checkAuth,
  clearError: state.clearError,
});

export const selectAuthError = (state: AuthState) => state.error;
