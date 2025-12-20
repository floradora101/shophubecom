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
import { apiClient, type ExtendedAxiosRequestConfig } from "@/lib/api/client";
import type { AuthResponse, AuthResponseData, User } from "./types";
import type { LoginFormData, RegisterFormData } from "./types";
export const authApi = {
  /**
   * Register a new user
   * @param data - Registration form data
   * @returns Auth response with user data (tokens in httpOnly cookies)
   */
  async register(data: RegisterFormData): Promise<AuthResponseData> {
    const response = await apiClient.post<AuthResponse>(
      "/auth/register",
      {
        email: data.email,
        password: data.password,
      },
      {
        _skipAuthRefresh: true,
      } as ExtendedAxiosRequestConfig
    );

    if (!response.data.success || !response.data.data) {
      throw new Error("Registration failed");
    }

    // Tokens are automatically set in httpOnly cookies by backend
    return response.data.data;
  },

  /**
   * Login with email and password
   * @param data - Login credentials
   * @returns Auth response with user data (tokens in httpOnly cookies)
   */
  async login(data: LoginFormData): Promise<AuthResponseData> {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      {
        email: data.email,
        password: data.password,
      },
      {
        _skipAuthRefresh: true,
      } as ExtendedAxiosRequestConfig
    );

    if (!response.data.success || !response.data.data) {
      throw new Error("Login failed");
    }

    // Tokens are automatically set in httpOnly cookies by backend
    return response.data.data;
  },

  /**
   * Logout current user
   * Clears refresh token on server and cookies
   */
  async logout(): Promise<void> {
    await apiClient.post("/auth/logout", {}, {
      _skipAuthRefresh: true,
    } as ExtendedAxiosRequestConfig);
  },

  /**
   * Refresh authentication tokens
   * @returns Auth response with user data (new tokens in httpOnly cookies)
   */
  async refresh(): Promise<AuthResponseData> {
    const response = await apiClient.post<AuthResponse>("/auth/refresh", {}, {
      _skipAuthRefresh: true,
    } as ExtendedAxiosRequestConfig);

    if (!response.data.success || !response.data.data) {
      throw new Error("Token refresh failed");
    }

    // Tokens are automatically set in httpOnly cookies by backend
    return response.data.data;
  },

  /**
   * Get current authenticated user
   * @returns Current user data
   * Note: Does NOT skip auth refresh - allows token refresh on 401
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: User }>(
      "/auth/me"
    );

    if (!response.data.success || !response.data.data) {
      throw new Error("Failed to get user data");
    }

    return response.data.data;
  },

  /**
   * Request password reset
   * @param email - User email address
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{
      success: boolean;
      data: { message: string };
    }>("/auth/forgot-password", { email }, {
      _skipAuthRefresh: true,
    } as ExtendedAxiosRequestConfig);

    if (!response.data.success || !response.data.data) {
      throw new Error("Failed to send password reset email");
    }

    return response.data.data;
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
    const response = await apiClient.post<{
      success: boolean;
      data: { message: string };
    }>("/auth/reset-password", { token, password }, {
      _skipAuthRefresh: true,
    } as ExtendedAxiosRequestConfig);

    if (!response.data.success || !response.data.data) {
      throw new Error("Failed to reset password");
    }

    return response.data.data;
  },
};
