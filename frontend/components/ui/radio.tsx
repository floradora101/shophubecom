// Radio component with consistent styling.
import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const radioId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id={radioId}
            className={cn(
              "h-4 w-4 border-gray-300 text-primary-500",
              "focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
              "cursor-pointer transition-colors",
              error && "border-error focus:ring-error/20",
              className
            )}
            ref={ref}
            {...props}
          />
          {label && (
            <label
              htmlFor={radioId}
              className="text-sm text-warm-gray-700 cursor-pointer select-none font-medium"
            >
              {label}
            </label>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
      </div>
    );
  }
);
Radio.displayName = "Radio";

export { Radio };
