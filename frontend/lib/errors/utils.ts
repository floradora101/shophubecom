/**
 * @file utils.ts
 *
 * Error Utilities
 *
 * Purpose:
 * Utility functions for error handling, extraction, and conversion.
 * Provides consistent error processing across the application.
 *
 * Usage:
 * - Extract error messages from various error types
 * - Convert errors to AppError instances
 * - Determine error severity and user messages
 */

import axios from "axios";
import type { ApiError } from "@/lib/types/api";
import {
  AppError,
  NetworkError,
  TimeoutError,
  AuthError,
  ValidationError,
  NotFoundError,
  ServerError,
  ErrorCode,
  ErrorSeverity,
  isAppError,
  type AppErrorDetails,
} from "./types";

/**
 * Extracts a user-friendly error message from various error types.
 *
 * Handles:
 * - AppError instances (returns userMessage or message)
 * - Axios errors with API response (extracts message from response.data)
 * - Axios timeout errors (ECONNABORTED)
 * - Network/server down errors (no response)
 * - Standard Error instances
 * - Unknown error types (fallback message)
 *
 * @param error - The error to extract a message from
 * @param fallback - Optional fallback message if error cannot be extracted
 * @returns A user-friendly error message string
 */
export function extractErrorMessage(error: unknown, fallback?: string): string {
  // Handle AppError instances
  if (isAppError(error)) {
    return error.userMessage || error.message || fallback || "An error occurred";
  }

  // Handle Axios errors
  if (axios.isAxiosError<ApiError>(error)) {
    // Timeout
    if (error.code === "ECONNABORTED") {
      return fallback || "Request timed out. Please try again.";
    }

    // No response = network/server down
    if (!error.response) {
      return (
        fallback ||
        "Cannot reach the server. Check your connection and try again."
      );
    }

    const data = error.response.data;

    // NestJS validation: message can be string[] (ValidationPipe)
    if (Array.isArray(data?.message) && data.message.length > 0) {
      const first = data.message[0];
      return typeof first === "string" ? first : String(first);
    }

    // Explicit errors array
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      const first = data.errors[0];
      return typeof first === "string" ? first : String(first);
    }

    return typeof data?.message === "string" ? data.message : fallback || "Request failed";
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return error.message || fallback || "An error occurred";
  }

  // Unknown error type
  return fallback || "An unexpected error occurred";
}

/**
 * Converts an unknown error to an AppError instance.
 *
 * @param error - The error to convert
 * @param fallbackMessage - Optional fallback message
 * @param context - Optional additional context
 * @returns AppError instance
 */
export function toAppError(
  error: unknown,
  fallbackMessage?: string,
  context?: Record<string, unknown>
): AppError {
  // Already an AppError
  if (isAppError(error)) {
    return error;
  }

  // Handle Axios errors
  if (axios.isAxiosError<ApiError>(error)) {
    // Timeout
    if (error.code === "ECONNABORTED") {
      return new TimeoutError(
        fallbackMessage || "Request timed out",
        context
      );
    }

    // No response = network error
    if (!error.response) {
      return new NetworkError(
        fallbackMessage || "Cannot reach the server. Check your connection.",
        context
      );
    }

    const statusCode = error.response.status;
    const data = error.response.data;

    // Extract message (handle NestJS validation array and explicit errors)
    let message: string;
    if (Array.isArray(data?.message) && data.message.length > 0) {
      const first = data.message[0];
      message = typeof first === "string" ? first : String(first);
    } else if (Array.isArray(data?.errors) && data.errors.length > 0) {
      const first = data.errors[0];
      message = typeof first === "string" ? first : String(first);
    } else {
      message =
        (typeof data?.message === "string" ? data.message : null) ||
        fallbackMessage ||
        "Request failed";
    }

    // Determine error type based on status code
    if (statusCode === 401 || statusCode === 403) {
      return new AuthError(message, statusCode, context);
    }

    if (statusCode === 404) {
      return new NotFoundError("Resource", { ...context, message });
    }

    if (statusCode === 400) {
      const fieldErrors = extractFieldErrors(data);
      return new ValidationError(message, fieldErrors, context);
    }

    if (statusCode >= 500) {
      return new ServerError(message, statusCode, context);
    }

    // Generic error for other status codes
    return new AppError({
      code: ErrorCode.UNKNOWN_ERROR,
      message,
      severity: statusCode >= 400 && statusCode < 500 ? ErrorSeverity.MEDIUM : ErrorSeverity.HIGH,
      statusCode,
      context,
    });
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return new AppError({
      code: ErrorCode.UNKNOWN_ERROR,
      message: error.message || fallbackMessage || "An error occurred",
      severity: ErrorSeverity.MEDIUM,
      context,
      originalError: error,
    });
  }

  // Unknown error type
  return new AppError({
    code: ErrorCode.UNKNOWN_ERROR,
    message: fallbackMessage || "An unexpected error occurred",
    severity: ErrorSeverity.MEDIUM,
    context,
    originalError: error,
  });
}

/**
 * Extracts field-level errors from API error response
 */
function extractFieldErrors(data: unknown): Record<string, string> | undefined {
  if (!data || typeof data !== "object") return undefined;

  // Check if errors is an object with field-level errors
  if ("errors" in data && typeof data.errors === "object" && data.errors !== null) {
    const errors = data.errors as Record<string, unknown>;
    const fieldErrors: Record<string, string> = {};

    for (const [key, value] of Object.entries(errors)) {
      if (typeof value === "string") {
        fieldErrors[key] = value;
      } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
        fieldErrors[key] = value[0];
      }
    }

    return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
  }

  return undefined;
}

/**
 * Determines if an error should be logged
 */
export function shouldLogError(error: unknown): boolean {
  if (isAppError(error)) {
    // Log high severity errors
    return error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL;
  }

  // Log by default for unknown errors
  return true;
}

/**
 * Gets error severity from error
 */
export function getErrorSeverity(error: unknown): ErrorSeverity {
  if (isAppError(error)) {
    return error.severity;
  }

  // Default to medium for unknown errors
  return ErrorSeverity.MEDIUM;
}

/**
 * Creates a user-friendly error message
 */
export function getUserMessage(error: unknown, fallback?: string): string {
  if (isAppError(error)) {
    return error.userMessage || error.message || fallback || "An error occurred";
  }

  return extractErrorMessage(error, fallback);
}
