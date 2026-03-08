/**
 * @file error-handler.ts
 *
 * Purpose:
 * Centralized API error handling utilities for consistent error display
 * across the application. Handles different error types and provides
 * user-friendly error messages.
 *
 * Responsibilities:
 * - Extract error messages from API responses (single source of truth)
 * - Categorize errors (401, 403, 404, 500, network, etc.)
 * - Provide user-friendly error messages
 * - Handle admin-specific errors
 * - Support NestJS validation (message as string[])
 */

import axios, { type AxiosError } from "axios";
import type { ApiError } from "@/lib/types/api";
import { isAppError } from "@/lib/errors/types";

function isAxiosError(error: unknown): error is AxiosError<ApiError> {
  return axios.isAxiosError(error);
}

export interface ErrorInfo {
  status: number | null;
  code: string | null;
  message: string;
  errors?: string[];
  isNetworkError: boolean;
  isAuthError: boolean;
  isForbiddenError: boolean;
  isNotFoundError: boolean;
  isServerError: boolean;
  isAdminError: boolean;
}

function extractRawMessage(data: ApiError | undefined): string {
  if (!data) return "An unexpected error occurred";
  // NestJS validation: message can be string[]
  if (Array.isArray(data.message) && data.message.length > 0) {
    const first = data.message[0];
    return typeof first === "string" ? first : String(first);
  }
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors[0];
  }
  return typeof data.message === "string" ? data.message : "An unexpected error occurred";
}

/** Map status + raw message to user-friendly message. Single source of truth. */
function toUserMessage(status: number, rawMessage: string, isAuthEndpoint = false): string {
  const isForbiddenError = status === 403;
  const isAdminError = isForbiddenError && rawMessage.toLowerCase().includes("admin");

  if (status === 401 && !isAuthEndpoint) return "Your session has expired. Please sign in again.";
  if (status === 401 && isAuthEndpoint) return rawMessage;
  if (isAdminError) return "You don't have permission to perform this action. Admin access is required.";
  if (isForbiddenError) return "You don't have permission to access this resource.";
  if (status === 404) return "The requested resource was not found.";
  if (status >= 500) return "A server error occurred. Please try again later.";
  return rawMessage;
}

/**
 * Build ErrorInfo from a failed API response (success: false).
 * Use when you have status + response data directly (e.g. from request wrappers).
 */
export function buildErrorInfoFromResponse(
  status: number,
  data: { message?: string | string[]; code?: string; errors?: string[] }
): ErrorInfo {
  const rawMessage = extractRawMessage(data as ApiError);
  const userMessage = toUserMessage(status, rawMessage, false);
  const errors = Array.isArray(data?.errors) ? data.errors : undefined;
  const isAuthError = status === 401;
  const isForbiddenError = status === 403;
  const isNotFoundError = status === 404;
  const isServerError = status >= 500;
  const isAdminError = isForbiddenError && rawMessage.toLowerCase().includes("admin");

  return {
    status,
    code: data?.code ?? `HTTP_${status}`,
    message: userMessage,
    errors,
    isNetworkError: false,
    isAuthError,
    isForbiddenError,
    isNotFoundError,
    isServerError,
    isAdminError,
  };
}

/**
 * Extract error information from any error type.
 * Single source of truth for error extraction across the app.
 */
export function extractErrorInfo(error: unknown): ErrorInfo {
  // AppError (from lib/errors)
  if (isAppError(error)) {
    const message = error.userMessage || error.message || "An error occurred";
    return {
      status: error.statusCode ?? null,
      code: error.code ?? "UNKNOWN_ERROR",
      message,
      isNetworkError: false,
      isAuthError: (error.statusCode ?? 0) === 401,
      isForbiddenError: (error.statusCode ?? 0) === 403,
      isNotFoundError: (error.statusCode ?? 0) === 404,
      isServerError: (error.statusCode ?? 0) >= 500,
      isAdminError: false,
    };
  }

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

  // Timeout
  if (error.code === "ECONNABORTED") {
    return {
      status: null,
      code: "TIMEOUT_ERROR",
      message: "Request timed out. Please try again.",
      isNetworkError: true,
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
  const rawMessage = extractRawMessage(data);
  const errors = data?.errors;

  const isAuthError = status === 401;
  const isForbiddenError = status === 403;
  const isNotFoundError = status === 404;
  const isServerError = status >= 500;
  const isAdminError = isForbiddenError && rawMessage.toLowerCase().includes("admin");

  const config = error.config as { _skipAuthRefresh?: boolean } | undefined;
  const isAuthEndpointRequest = config?._skipAuthRefresh === true;
  const userMessage = toUserMessage(status, rawMessage, isAuthEndpointRequest);

  return {
    status,
    code: data?.code ?? `HTTP_${status}`,
    message: userMessage,
    errors: Array.isArray(errors) ? errors : undefined,
    isNetworkError: false,
    isAuthError,
    isForbiddenError,
    isNotFoundError,
    isServerError,
    isAdminError,
  };
}

/**
 * Extract user-friendly error message. Use when only the message string is needed.
 * @param error - Any error
 * @param fallback - Optional fallback if message cannot be extracted
 */
export function extractErrorMessage(error: unknown, fallback?: string): string {
  const info = extractErrorInfo(error);
  return info.message || fallback || "An unexpected error occurred";
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

/**
 * API request error that preserves HTTP status, code, and validation errors.
 * Thrown by apiGet/apiPost/etc wrappers so callers can check error.statusCode.
 */
export class ApiRequestError extends Error {
  readonly statusCode: number | null;
  readonly code: string | null;
  readonly errors?: string[];

  constructor(info: ErrorInfo) {
    super(info.message);
    this.name = "ApiRequestError";
    this.statusCode = info.status;
    this.code = info.code;
    this.errors = info.errors;
    Object.setPrototypeOf(this, ApiRequestError.prototype);
  }

  get isAuthError(): boolean {
    return this.statusCode === 401;
  }

  get isForbidden(): boolean {
    return this.statusCode === 403;
  }

  get isNotFound(): boolean {
    return this.statusCode === 404;
  }

  get isServerError(): boolean {
    return this.statusCode !== null && this.statusCode >= 500;
  }
}
