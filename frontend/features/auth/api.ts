/**
 * @file api.ts
 *
 * Purpose:
 * API client functions for all authentication endpoints. Provides a clean
 * interface for making authentication-related API calls.
 *
 * Responsibilities:
 * - register(): POST /auth/register - Create new user account
 * - login(): POST /auth/login - Authenticate user with credentials
 * - logout(): POST /auth/logout - Clear authentication cookies
 * - refresh(): POST /auth/refresh - Refresh access and refresh tokens
 * - getMe(): GET /auth/me - Get current authenticated user
 * - forgotPassword(): POST /auth/forgot-password - Request password reset
 * - resetPassword(): POST /auth/reset-password - Reset password with token
 *
 * How it fits into auth flow:
 * - Called by auth-store for login, register, logout, bootstrap operations
 * - Called by LoginForm/RegisterForm components
 * - Uses apiClient which automatically includes httpOnly cookies
 * - Tokens are sent/received via httpOnly cookies (not in request/response body)
 * - Backend sets tokens in cookies, returns only user data in response
 *
 * Security:
 * - Tokens are handled via httpOnly cookies automatically
 * - No tokens in request/response bodies
 * - All requests include credentials (cookies) via withCredentials: true
 */
import { apiPost, apiGet } from "@/lib/api/request";
import { USE_MOCKS } from "@/lib/flags";
import type { AuthResponseData } from "./types";
import type { LoginFormData, RegisterFormData } from "./types";
import { setCsrfToken } from "./csrf";

export { getCsrfToken } from "./csrf";

function ensureAuthBackendAvailable(): void {
  if (USE_MOCKS) {
    throw new Error(
      "Authentication requires backend mode. Disable NEXT_PUBLIC_USE_MOCKS to use auth flows."
    );
  }
}

export const authApi = {
  /**
   * Fetch CSRF token. Call on app init when using cross-origin auth.
   * Uses fetch to avoid circular dependency with apiClient.
   */
  async fetchCsrfToken(): Promise<string | null> {
    ensureAuthBackendAvailable();
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const url = base.endsWith("/api") ? `${base.replace(/\/$/, "")}/auth/csrf` : `${base}/auth/csrf`;
    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) return null;
      const data = (await res.json()) as { csrfToken?: string };
      const token = data?.csrfToken ?? null;
      setCsrfToken(token);
      return token;
    } catch {
      return null;
    }
  },

  /**
   * Register a new user
   * @param data - Registration form data
   * @returns Auth response with user data (tokens in httpOnly cookies)
   */
  async register(data: RegisterFormData): Promise<AuthResponseData> {
    ensureAuthBackendAvailable();
    return apiPost<AuthResponseData>(
      "/auth/register",
      {
        email: data.email,
        firstName: data.firstName?.trim() || undefined,
        lastName: data.lastName?.trim() || undefined,
        password: data.password,
      },
      { _skipAuthRefresh: true }
    );
  },

  /**
   * Login with email and password
   * @param data - Login credentials
   * @returns Auth response with user data (tokens in httpOnly cookies)
   */
  async login(data: LoginFormData): Promise<AuthResponseData> {
    ensureAuthBackendAvailable();
    return apiPost<AuthResponseData>(
      "/auth/login",
      {
        email: data.email,
        password: data.password,
      },
      { _skipAuthRefresh: true }
    );
  },

  /**
   * Logout current user
   * Clears refresh token on server and cookies
   */
  async logout(): Promise<void> {
    ensureAuthBackendAvailable();
    await apiPost<void>("/auth/logout", {}, { _skipAuthRefresh: true });
  },

  /**
   * Refresh authentication tokens
   * @returns Auth response with user data (new tokens in httpOnly cookies)
   */
  async refresh(): Promise<AuthResponseData> {
    ensureAuthBackendAvailable();
    return apiPost<AuthResponseData>("/auth/refresh", {}, { _skipAuthRefresh: true });
  },

  /**
   * Get current authenticated user
   * @returns User data and expiresIn (for proactive token refresh)
   * Note: Does NOT skip auth refresh - allows token refresh on 401
   */
  async getMe(): Promise<AuthResponseData> {
    ensureAuthBackendAvailable();
    return apiGet<AuthResponseData>("/auth/me");
  },

  /**
   * Request password reset
   * @param email - User email address
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    ensureAuthBackendAvailable();
    return apiPost<{ message: string }>(
      "/auth/forgot-password",
      { email },
      { _skipAuthRefresh: true }
    );
  },

  /**
   * Reset password with token
   * @param token - Password reset token
   * @param password - New password
   */
  async resetPassword(
    token: string,
    password: string
  ): Promise<{ message: string }> {
    ensureAuthBackendAvailable();
    return apiPost<{ message: string }>(
      "/auth/reset-password",
      { token, password },
      { _skipAuthRefresh: true }
    );
  },
};
