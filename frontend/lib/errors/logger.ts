/**
 * @file logger.ts
 *
 * Error Logging Utilities
 *
 * Purpose:
 * Centralized error logging for consistent error tracking and debugging.
 * Provides structured logging with context and severity levels.
 *
 * Usage:
 * - Log errors with structured context
 * - Send errors to external services (Sentry, etc.)
 * - Track error patterns and frequencies
 */

import { AppError, isAppError, ErrorSeverity, type AppErrorDetails } from "./types";
import { shouldLogError, getErrorSeverity } from "./utils";

/**
 * Error log entry structure
 */
export interface ErrorLogEntry extends AppErrorDetails {
  /** Component or module where error occurred */
  component?: string;
  /** User action that triggered the error */
  action?: string;
  /** Browser/user agent info */
  userAgent?: string;
  /** Current route/page */
  route?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Error logger configuration
 */
interface ErrorLoggerConfig {
  /** Enable error logging */
  enabled?: boolean;
  /** Log to console in development */
  logToConsole?: boolean;
  /** Send to external service (Sentry, etc.) */
  sendToExternal?: boolean;
  /** Minimum severity to log */
  minSeverity?: ErrorSeverity;
}

const defaultConfig: Required<ErrorLoggerConfig> = {
  enabled: true,
  logToConsole: process.env.NODE_ENV === "development",
  sendToExternal: process.env.NODE_ENV === "production",
  minSeverity: ErrorSeverity.MEDIUM,
};

let config: Required<ErrorLoggerConfig> = { ...defaultConfig };

/** Numeric severity for comparison (higher = more severe) */
const SEVERITY_ORDER: Record<ErrorSeverity, number> = {
  [ErrorSeverity.LOW]: 1,
  [ErrorSeverity.MEDIUM]: 2,
  [ErrorSeverity.HIGH]: 3,
  [ErrorSeverity.CRITICAL]: 4,
};

function severityMeetsMinimum(severity: ErrorSeverity, min: ErrorSeverity): boolean {
  return SEVERITY_ORDER[severity] >= SEVERITY_ORDER[min];
}

/**
 * Configure error logger
 */
export function configureErrorLogger(newConfig: Partial<ErrorLoggerConfig>) {
  config = { ...config, ...newConfig };
}

/**
 * Log an error with context
 *
 * @param error - The error to log
 * @param context - Additional context about where/why the error occurred
 */
export function logError(error: unknown, context?: Partial<ErrorLogEntry>): void {
  if (!config.enabled) return;

  // Convert to AppError if needed
  const appError = isAppError(error)
    ? error
    : new AppError({
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        originalError: error,
      });

  // Check minimum severity (only log if error severity meets or exceeds minimum)
  if (!severityMeetsMinimum(appError.severity, config.minSeverity)) return;

  // Check if should log
  if (!shouldLogError(appError)) return;

  // Build log entry
  const logEntry: ErrorLogEntry = {
    code: appError.code,
    message: appError.message,
    severity: appError.severity,
    statusCode: appError.statusCode,
    context: { ...appError.context, ...context?.context },
    timestamp: appError.timestamp,
    userMessage: appError.userMessage,
    component: context?.component,
    action: context?.action,
    route: context?.route || (typeof window !== "undefined" ? window.location.pathname : undefined),
    userAgent:
      context?.userAgent || (typeof window !== "undefined" ? window.navigator.userAgent : undefined),
    metadata: context?.metadata,
  };

  // Log to console in development
  if (config.logToConsole) {
    console.error("[Error Logger]", logEntry);
    if (appError.originalError) {
      console.error("[Original Error]", appError.originalError);
    }
  }

  // Send to external service (Sentry, etc.)
  if (config.sendToExternal && typeof window !== "undefined") {
    // TODO: Integrate with external error tracking service
    // Example: Sentry.captureException(appError, { extra: logEntry });
  }
}

/**
 * Log a warning (non-critical error)
 */
export function logWarning(message: string, context?: Partial<ErrorLogEntry>): void {
  if (!config.enabled || !config.logToConsole) return;

  console.warn("[Warning]", message, context);
}

/**
 * Log an info message (for debugging)
 */
export function logInfo(message: string, context?: Record<string, unknown>): void {
  if (!config.enabled || !config.logToConsole) return;

  console.info("[Info]", message, context);
}

/**
 * Create error logger for a specific component
 */
export function createComponentLogger(component: string) {
  return {
    logError: (error: unknown, context?: Omit<Partial<ErrorLogEntry>, "component">) => {
      logError(error, { ...context, component });
    },
    logWarning: (message: string, context?: Omit<Partial<ErrorLogEntry>, "component">) => {
      logWarning(message, { ...context, component });
    },
    logInfo: (message: string, context?: Record<string, unknown>) => {
      logInfo(message, { ...context, component });
    },
  };
}
