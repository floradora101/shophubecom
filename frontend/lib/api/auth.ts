import { apiClient, type ExtendedAxiosRequestConfig } from "./client";
import type { AuthResponse, AuthResponseData, User } from "../types/auth.types";
import type { LoginFormData, RegisterFormData } from "../types/auth.types";

/**
 * Authentication API client
 * Handles all authentication-related API calls
 *
 * Security: Tokens are sent/received via httpOnly cookies automatically.
 * Backend returns only user data in response body (no tokens).
 */
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
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: User }>(
      "/auth/me",
      {
        _skipAuthRefresh: true,
      } as ExtendedAxiosRequestConfig
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
