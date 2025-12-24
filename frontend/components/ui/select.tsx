// Select component with consistent styling.
import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-2 block text-sm font-medium text-warm-gray-700"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          className={cn(
            "flex h-10 w-full rounded-lg border border-warm-gray-300 bg-white px-3 py-2 text-sm transition-colors",
            "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-warm-gray-50",
            "cursor-pointer",
            error && "border-error focus:border-error focus:ring-error/20",
            className
          )}
          ref={ref}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
        {!error && helperText && (
          <p className="mt-1.5 text-xs text-warm-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };

