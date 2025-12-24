// Textarea component with consistent styling.
import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-2 block text-sm font-medium text-warm-gray-700"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            "flex min-h-[80px] w-full rounded-lg border border-warm-gray-300 bg-white px-3 py-2 text-sm transition-colors",
            "placeholder:text-warm-gray-400",
            "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-warm-gray-50",
            "resize-y",
            error && "border-error focus:border-error focus:ring-error/20",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
        {!error && helperText && (
          <p className="mt-1.5 text-xs text-warm-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };

