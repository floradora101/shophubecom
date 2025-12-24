/**
 * Reusable FormField component with built-in accessibility features
 * Follows WCAG 2.1 guidelines for form accessibility
 */

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface FormFieldProps {
  /** Field label - required for accessibility */
  label: string;
  /** Whether the field is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Help text or description */
  helpText?: string;
  /** Field ID - auto-generated from label if not provided */
  id?: string;
  /** Additional className for the wrapper */
  className?: string;
  /** Children (the actual input/select/textarea element) */
  children: React.ReactNode;
  /** HTMLFor attribute for label (usually same as id) */
  htmlFor?: string;
}

/**
 * FormField - Wraps form inputs with consistent labeling, error handling, and accessibility
 *
 * Features:
 * - Automatic ID generation from label
 * - ARIA attributes for error states
 * - Consistent error styling
 * - Required field indicators
 * - Help text support
 *
 * Usage:
 * ```tsx
 * <FormField
 *   label="Email"
 *   required
 *   error={errors.email?.message}
 *   helpText="We'll never share your email"
 * >
 *   <input
 *     type="email"
 *     {...register("email")}
 *     aria-invalid={!!errors.email}
 *     aria-describedby={errors.email ? "email-error" : "email-help"}
 *   />
 * </FormField>
 * ```
 */
export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      label,
      required = false,
      error,
      helpText,
      id,
      className,
      children,
      htmlFor,
    },
    ref
  ) => {
    // Generate ID from label if not provided
    const fieldId =
      id || `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const errorId = `${fieldId}-error`;
    const helpId = `${fieldId}-help`;

    // Determine which element should be described by aria-describedby
    const describedBy = error ? errorId : helpText ? helpId : undefined;

    // Clone children to add necessary props
    const childrenWithProps = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, {
          id: fieldId,
          "aria-invalid": error ? true : undefined,
          "aria-describedby": describedBy,
          "aria-required": required ? true : undefined,
        });
      }
      return child;
    });

    return (
      <div ref={ref} className={cn("w-full", className)}>
        <label
          htmlFor={htmlFor || fieldId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>

        {childrenWithProps}

        {helpText && !error && (
          <p id={helpId} className="mt-1.5 text-xs text-gray-500" role="note">
            {helpText}
          </p>
        )}

        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-xs text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";
