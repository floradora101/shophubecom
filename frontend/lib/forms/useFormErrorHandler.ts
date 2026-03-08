/**
 * Hook for standardized form error handling
 * Provides consistent error extraction and display across all forms
 */

import { useState, useCallback } from "react";
import { FieldErrors } from "react-hook-form";
import { extractErrorMessage } from "@/lib/api/error-handler";
import { logError } from "@/lib/errors/logger";

export interface UseFormErrorHandlerOptions {
  /** Fallback error message */
  fallbackMessage?: string;
  /** Whether to log errors to console in development */
  logErrors?: boolean;
}

export interface UseFormErrorHandlerReturn {
  /** Current form-level error */
  formError: string | null;
  /** Set form-level error */
  setFormError: (error: string | null) => void;
  /** Handle API/submission errors */
  handleError: (error: unknown) => void;
  /** Handle validation errors from react-hook-form */
  handleValidationError: (errors: FieldErrors) => void;
  /** Clear all errors */
  clearError: () => void;
}

/**
 * useFormErrorHandler - Standardized error handling for forms
 *
 * Provides:
 * - Consistent error extraction from various error types
 * - Validation error formatting
 * - Error state management
 * - Development error logging
 *
 * Usage:
 * ```tsx
 * const { formError, handleError, handleValidationError, clearError } = useFormErrorHandler({
 *   fallbackMessage: "Failed to save. Please try again.",
 * });
 *
 * const onSubmit = async (data) => {
 *   try {
 *     await saveData(data);
 *   } catch (error) {
 *     handleError(error);
 *   }
 * };
 *
 * const onError = (errors) => {
 *   handleValidationError(errors);
 * };
 * ```
 */
export function useFormErrorHandler(
  options: UseFormErrorHandlerOptions = {}
): UseFormErrorHandlerReturn {
  const {
    fallbackMessage,
    logErrors = process.env.NODE_ENV === "development",
  } = options;

  const [formError, setFormError] = useState<string | null>(null);

  const handleError = useCallback(
    (error: unknown) => {
      const message = extractErrorMessage(error, fallbackMessage);
      setFormError(message);

      if (logErrors) {
        logError(error, {
          component: "FormErrorHandler",
          action: "form_submission_error",
          metadata: {
            fallbackMessage,
          },
        });
      }
    },
    [fallbackMessage, logErrors]
  );

  const handleValidationError = useCallback(
    (errors: FieldErrors) => {
      // Extract first error message
      const firstError = getFirstErrorMessage(errors);
      if (firstError) {
        setFormError(firstError);
      } else {
        setFormError("Please fix the highlighted fields.");
      }

      if (logErrors) {
        logError(
          new Error("Form validation failed"),
          {
            component: "FormErrorHandler",
            action: "form_validation_error",
            metadata: {
              validationErrors: errors,
              firstError,
            },
          }
        );
      }
    },
    [logErrors]
  );

  const clearError = useCallback(() => {
    setFormError(null);
  }, []);

  return {
    formError,
    setFormError,
    handleError,
    handleValidationError,
    clearError,
  };
}

/**
 * Recursively extracts the first error message from FieldErrors
 */
function getFirstErrorMessage(
  errors: FieldErrors,
  path: string[] = []
): string | null {
  for (const [key, value] of Object.entries(errors)) {
    const currentPath = [...path, key];

    if (value?.message && typeof value.message === "string") {
      // Format path for display (e.g., "variants.0.price" -> "Variant 1 - Price")
      const displayPath = formatErrorPath(currentPath);
      return `${displayPath}: ${value.message}`;
    }

    if (value && typeof value === "object" && !("message" in value)) {
      // Nested errors (e.g., variants array)
      const nested = getFirstErrorMessage(value as FieldErrors, currentPath);
      if (nested) return nested;
    }
  }

  return null;
}

/**
 * Formats error path for user-friendly display
 */
function formatErrorPath(path: string[]): string {
  if (path.length === 0) return "";

  // Handle array indices (e.g., variants.0 -> Variant 1)
  const formatted = path.map((segment, index) => {
    // Check if previous segment suggests this is an array index
    const prevSegment = path[index - 1];
    const isArrayIndex = /^\d+$/.test(segment);

    if (isArrayIndex && prevSegment) {
      const number = parseInt(segment, 10) + 1;
      const singular = prevSegment.replace(/s$/, "");
      return `${
        singular.charAt(0).toUpperCase() + singular.slice(1)
      } ${number}`;
    }

    // Capitalize first letter
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  });

  return formatted.join(" - ");
}

