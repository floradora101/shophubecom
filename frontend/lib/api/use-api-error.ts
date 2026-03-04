/**
 * @file use-api-error.ts
 *
 * Purpose:
 * React hook for handling API errors consistently across components.
 * Provides error information and helper functions for error display.
 */

import { useCallback } from "react";
import { extractErrorInfo, getErrorTitle, isRetryableError, type ErrorInfo } from "./error-handler";
import { toast } from "sonner";

/**
 * Hook for handling API errors consistently
 */
export function useApiError() {
  const handleError = useCallback((error: unknown, options?: {
    showToast?: boolean;
    toastTitle?: string;
    onError?: (errorInfo: ErrorInfo) => void;
  }) => {
    const errorInfo = extractErrorInfo(error);
    const { showToast = true, toastTitle, onError } = options || {};

    // Call custom error handler if provided
    onError?.(errorInfo);

    // Show toast notification if enabled
    if (showToast) {
      const title = toastTitle || getErrorTitle(errorInfo);
      toast.error(title, {
        description: errorInfo.message,
        duration: errorInfo.isAuthError ? 5000 : 4000,
      });
    }

    return errorInfo;
  }, []);

  const isRetryable = useCallback((error: unknown): boolean => {
    const errorInfo = extractErrorInfo(error);
    return isRetryableError(errorInfo);
  }, []);

  return {
    handleError,
    isRetryable,
    extractErrorInfo,
    getErrorTitle,
  };
}
