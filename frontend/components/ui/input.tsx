// Input field component.
import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, errorMessage, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-warm-gray-700"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            "flex h-11 w-full rounded-lg border border-warm-gray-200 bg-white px-3 py-2 text-sm text-warm-gray-900 transition-all",
            "placeholder:text-warm-gray-400",
            "hover:border-warm-gray-300",
            "focus:border-primary-500 focus:bg-white focus:text-warm-gray-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10",
            "selection:bg-primary-100 selection:text-primary-900",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-warm-gray-50",
            error &&
              "border-error focus:border-error focus-visible:ring-error/20",
            className
          )}
          ref={ref}
          {...props}
        />
        {errorMessage && (
          <p className="mt-1.5 text-xs text-red-600" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
