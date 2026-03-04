/**
 * @file error-handler.ts
 *
 * Purpose:
 * Centralized API error handling utilities for consistent error display
 * across the application. Handles different error types and provides
 * user-friendly error messages.
 *
 * Responsibilities:
 * - Extract error messages from API responses
 * - Categorize errors (401, 403, 404, 500, network, etc.)
 * - Provide user-friendly error messages
 * - Handle admin-specific errors
 */

import axios, { type AxiosError } from "axios";
import type { ApiError } from "@/lib/types/api";

function isAxiosError(error: unknown): error is AxiosError<ApiError> {
  return axios.isAxiosError(error);
}

export interface ErrorInfo {
  status: number | null;
  code: string | null;
  message: string;
  isNetworkError: boolean;
  isAuthError: boolean;
  isForbiddenError: boolean;
  isNotFoundError: boolean;
  isServerError: boolean;
  isAdminError: boolean;
}

/**
 * Extract error information from an Axios error.
 * Handles non-Axios errors gracefully (e.g. thrown strings, custom errors).
 */
export function extractErrorInfo(error: unknown): ErrorInfo {
  if (!isAxiosError(error)) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return {
      status: null,
      code: "UNKNOWN_ERROR",
      message,
      isNetworkError: false,
      isAuthError: false,
      isForbiddenError: false,
      isNotFoundError: false,
      isServerError: false,
      isAdminError: false,
    };
  }

  // Network error (no response)
  if (!error.response) {
    return {
      status: null,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server. Please check your internet connection.",
      isNetworkError: true,
      isAuthError: false,
      isForbiddenError: false,
      isNotFoundError: false,
      isServerError: false,
      isAdminError: false,
    };
  }

  const status = error.response.status;
  const data = error.response.data;
  const message = data?.message || error.message || "An unexpected error occurred";

  // Determine error type
  const isAuthError = status === 401;
  const isForbiddenError = status === 403;
  const isNotFoundError = status === 404;
  const isServerError = status >= 500;
  const isAdminError = isForbiddenError && message.toLowerCase().includes("admin");

  // Get user-friendly message based on status
  let userMessage = message;

  if (isAuthError) {
    userMessage = "Your session has expired. Please sign in again.";
  } else if (isAdminError) {
    userMessage = "You don't have permission to perform this action. Admin access is required.";
  } else if (isForbiddenError) {
    userMessage = "You don't have permission to access this resource.";
  } else if (isNotFoundError) {
    userMessage = "The requested resource was not found.";
  } else if (isServerError) {
    userMessage = "A server error occurred. Please try again later.";
  }

  return {
    status,
    code: data?.code ?? `HTTP_${status}`,
    message: userMessage,
    isNetworkError: false,
    isAuthError,
    isForbiddenError,
    isNotFoundError,
    isServerError,
    isAdminError,
  };
}

/**
 * Get error title based on error type
 */
export function getErrorTitle(errorInfo: ErrorInfo): string {
  if (errorInfo.isNetworkError) {
    return "Connection Error";
  }
  if (errorInfo.isAuthError) {
    return "Authentication Required";
  }
  if (errorInfo.isAdminError || errorInfo.isForbiddenError) {
    return "Access Denied";
  }
  if (errorInfo.isNotFoundError) {
    return "Not Found";
  }
  if (errorInfo.isServerError) {
    return "Server Error";
  }
  return "Error";
}

/**
 * Check if error is retryable
 */
export function isRetryableError(errorInfo: ErrorInfo): boolean {
  return (
    errorInfo.isNetworkError ||
    errorInfo.isServerError ||
    (errorInfo.status !== null && errorInfo.status >= 500)
  );
}
