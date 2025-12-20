/**
 * Reusable FormErrorAlert component for displaying form-level errors
 * Provides consistent error display with accessibility features
 */

import * as React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils/cn";

export interface FormErrorAlertProps {
  /** Error message to display */
  error: string | null | undefined;
  /** Callback when user dismisses the error */
  onDismiss?: () => void;
  /** Additional className */
  className?: string;
  /** Whether to show dismiss button */
  dismissible?: boolean;
}

/**
 * FormErrorAlert - Displays form-level errors with consistent styling
 *
 * Features:
 * - ARIA live region for screen readers
 * - Dismissible option
 * - Consistent error styling
 * - Accessible error announcements
 *
 * Usage:
 * ```tsx
 * <FormErrorAlert
 *   error={formError}
 *   onDismiss={() => setFormError(null)}
 *   dismissible
 * />
 * ```
 */
export function FormErrorAlert({
  error,
  onDismiss,
  className,
  dismissible = true,
}: FormErrorAlertProps) {
  if (!error) return null;

  return (
    <Alert
      variant="destructive"
      className={cn("mb-4", className)}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        {dismissible && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="ml-4 text-sm underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded"
            aria-label="Dismiss error message"
          >
            Dismiss
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
}

