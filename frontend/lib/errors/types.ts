/**
 * @file types.ts
 *
 * Error Types and Class Definitions
 *
 * Purpose:
 * Centralized error type definitions for consistent error handling across the application.
 * Provides custom error classes for different error scenarios.
 *
 * Architecture:
 * - Base error classes for different error categories
 * - Type guards for error type checking
 * - Error code constants for consistent error identification
 */

/**
 * Error codes for different error categories
 */
export enum ErrorCode {
  // Network errors
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  CONNECTION_ERROR = "CONNECTION_ERROR",

  // Authentication errors
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  AUTH_EXPIRED = "AUTH_EXPIRED",

  // Validation errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",

  // Resource errors
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  BAD_REQUEST = "BAD_REQUEST",

  // Server errors
  SERVER_ERROR = "SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",

  // Unknown errors
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Base error interface
 */
export interface AppErrorDetails {
  /** Error code for categorization */
  code: ErrorCode | string;
  /** Human-readable error message */
  message: string;
  /** Error severity level */
  severity?: ErrorSeverity;
  /** HTTP status code (if applicable) */
  statusCode?: number;
  /** Additional error context */
  context?: Record<string, unknown>;
  /** Original error (if wrapped) */
  originalError?: unknown;
  /** Timestamp when error occurred */
  timestamp?: Date;
  /** User-friendly message for display */
  userMessage?: string;
}

/**
 * Base AppError class
 *
 * Extends native Error to provide additional context and structure
 */
export class AppError extends Error implements AppErrorDetails {
  public readonly code: ErrorCode | string;
  public readonly severity: ErrorSeverity;
  public readonly statusCode?: number;
  public readonly context?: Record<string, unknown>;
  public readonly originalError?: unknown;
  public readonly timestamp: Date;
  public readonly userMessage?: string;

  constructor(details: AppErrorDetails) {
    super(details.message);
    this.name = "AppError";
    this.code = details.code;
    this.severity = details.severity ?? ErrorSeverity.MEDIUM;
    this.statusCode = details.statusCode;
    this.context = details.context;
    this.originalError = details.originalError;
    this.timestamp = details.timestamp ?? new Date();
    this.userMessage = details.userMessage ?? details.message;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Convert error to JSON for logging
   */
  toJSON(): AppErrorDetails {
    return {
      code: this.code,
      message: this.message,
      severity: this.severity,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp,
      userMessage: this.userMessage,
    };
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super({
      code: ErrorCode.NETWORK_ERROR,
      message,
      severity: ErrorSeverity.HIGH,
      context,
    });
    this.name = "NetworkError";
  }
}

/**
 * Timeout errors
 */
export class TimeoutError extends AppError {
  constructor(message: string = "Request timed out", context?: Record<string, unknown>) {
    super({
      code: ErrorCode.TIMEOUT_ERROR,
      message,
      severity: ErrorSeverity.MEDIUM,
      context,
    });
    this.name = "TimeoutError";
  }
}

/**
 * Authentication errors
 */
export class AuthError extends AppError {
  constructor(message: string, statusCode?: number, context?: Record<string, unknown>) {
    super({
      code: ErrorCode.UNAUTHORIZED,
      message,
      severity: ErrorSeverity.HIGH,
      statusCode: statusCode ?? 401,
      context,
    });
    this.name = "AuthError";
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  public readonly fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    fieldErrors?: Record<string, string>,
    context?: Record<string, unknown>
  ) {
    super({
      code: ErrorCode.VALIDATION_ERROR,
      message,
      severity: ErrorSeverity.LOW,
      statusCode: 400,
      context,
    });
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Resource not found errors
 */
export class NotFoundError extends AppError {
  constructor(resource: string, context?: Record<string, unknown>) {
    super({
      code: ErrorCode.NOT_FOUND,
      message: `${resource} not found`,
      userMessage: `The requested ${resource} could not be found.`,
      severity: ErrorSeverity.MEDIUM,
      statusCode: 404,
      context,
    });
    this.name = "NotFoundError";
  }
}

/**
 * Server errors
 */
export class ServerError extends AppError {
  constructor(message: string, statusCode: number = 500, context?: Record<string, unknown>) {
    super({
      code: ErrorCode.SERVER_ERROR,
      message,
      severity: ErrorSeverity.CRITICAL,
      statusCode,
      context,
    });
    this.name = "ServerError";
  }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if error is a NetworkError
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * Type guard to check if error is an AuthError
 */
export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

/**
 * Type guard to check if error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}
