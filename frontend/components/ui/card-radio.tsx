// CardRadio component - card-based radio selection
import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Card } from "./card";
import { RadioGroup, type RadioOption } from "./radio-group";
import { Stack } from "./stack";
import { Text } from "./typography";

export interface CardRadioOption {
  value: string;
  label: string;
  title: string;
  description?: string;
  rightAlignedMeta?: React.ReactNode;
  disabled?: boolean;
}

export interface CardRadioProps {
  /** Name attribute for the radio group */
  name: string;
  /** Array of card radio options */
  options: CardRadioOption[];
  /** Currently selected value */
  value?: string;
  /** Callback when value changes */
  onValueChange?: (value: string) => void;
  /** Error message to display */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Additional className */
  className?: string;
}

const CardRadio = React.forwardRef<HTMLDivElement, CardRadioProps>(
  (
    {
      name,
      options,
      value,
      onValueChange,
      error,
      required = false,
      className,
      ...props
    },
    ref
  ) => {
    const radioOptions: RadioOption[] = options.map((option) => ({
      value: option.value,
      label: option.label,
      description: option.description,
      disabled: option.disabled,
    }));

    return (
      <div ref={ref} className={cn("space-y-3", className)} {...props}>
        <RadioGroup
          name={name}
          options={radioOptions}
          value={value}
          onValueChange={onValueChange}
          error={error}
          required={required}
          className="sr-only" // Hide the radio group visually
        />

        <div className="grid gap-3">
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <Card
                key={option.value}
                variant="default"
                className={cn(
                  "cursor-pointer transition-all duration-200",
                  "hover:border-primary-300 hover:shadow-sm",
                  "focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2",
                  isSelected && [
                    "border-primary-500 bg-primary-50/50",
                    "ring-2 ring-primary-500 ring-offset-2",
                    "shadow-sm",
                  ],
                  option.disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() =>
                  !option.disabled && onValueChange?.(option.value)
                }
                role="radio"
                aria-checked={isSelected}
                aria-disabled={option.disabled}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    !option.disabled && onValueChange?.(option.value);
                  }
                }}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Hidden radio input for form integration */}
                    <input
                      type="radio"
                      name={name}
                      value={option.value}
                      checked={isSelected}
                      onChange={() =>
                        !option.disabled && onValueChange?.(option.value)
                      }
                      className="sr-only"
                      required={required}
                    />

                    {/* Visual radio indicator */}
                    <div
                      className={cn(
                        "shrink-0 w-4 h-4 rounded-full border-2 mt-0.5 transition-colors",
                        isSelected
                          ? "border-primary-500 bg-primary-500"
                          : "border-warm-gray-300 bg-white"
                      )}
                    >
                      {isSelected && (
                        <div className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-warm-gray-900 text-sm">
                          {option.title}
                        </h4>
                        {option.rightAlignedMeta && (
                          <div className="shrink-0 text-right">
                            {option.rightAlignedMeta}
                          </div>
                        )}
                      </div>

                      {option.description && (
                        <Text
                          variant="meta"
                          className="text-warm-gray-600 mt-1"
                        >
                          {option.description}
                        </Text>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {error && (
          <p className="mt-2 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

CardRadio.displayName = "CardRadio";

export { CardRadio };
