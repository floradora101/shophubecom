// RadioGroup component with accessibility and react-hook-form integration
import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Radio } from "./radio";
import { Stack } from "./stack";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Name attribute for the radio group */
  name: string;
  /** Array of radio options */
  options: RadioOption[];
  /** Currently selected value */
  value?: string;
  /** Callback when value changes */
  onValueChange?: (value: string) => void;
  /** Error message to display */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Orientation of the radio group */
  orientation?: "vertical" | "horizontal";
  /** Additional className */
  className?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      name,
      options,
      value,
      onValueChange,
      error,
      required = false,
      orientation = "vertical",
      className,
      ...props
    },
    ref
  ) => {
    const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);

    // Handle keyboard navigation
    const handleKeyDown = (event: React.KeyboardEvent) => {
      const currentIndex = options.findIndex(
        (option) => option.value === value
      );
      let newIndex = currentIndex;

      switch (event.key) {
        case "ArrowUp":
        case "ArrowLeft":
          event.preventDefault();
          newIndex = Math.max(0, currentIndex - 1);
          break;
        case "ArrowDown":
        case "ArrowRight":
          event.preventDefault();
          newIndex = Math.min(options.length - 1, currentIndex + 1);
          break;
        case "Home":
          event.preventDefault();
          newIndex = 0;
          break;
        case "End":
          event.preventDefault();
          newIndex = options.length - 1;
          break;
        default:
          return;
      }

      // Skip disabled options
      while (newIndex !== currentIndex && options[newIndex]?.disabled) {
        if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
          newIndex = Math.max(0, newIndex - 1);
        } else {
          newIndex = Math.min(options.length - 1, newIndex + 1);
        }
      }

      if (
        newIndex !== currentIndex &&
        options[newIndex] &&
        !options[newIndex].disabled
      ) {
        onValueChange?.(options[newIndex].value);
        setFocusedIndex(newIndex);
      }
    };

    const handleRadioChange = (optionValue: string) => {
      onValueChange?.(optionValue);
    };

    const handleRadioFocus = (index: number) => {
      setFocusedIndex(index);
    };

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label={name}
        aria-invalid={!!error}
        aria-required={required}
        className={cn(
          orientation === "horizontal" ? "flex gap-6" : "",
          className
        )}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <Stack spacing={orientation === "vertical" ? "sm" : undefined}>
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isFocused = focusedIndex === index;

            return (
              <div key={option.value} className="relative">
                <Radio
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  onChange={() => handleRadioChange(option.value)}
                  onFocus={() => handleRadioFocus(index)}
                  disabled={option.disabled}
                  error={error}
                  label={option.label}
                  className={cn(
                    "cursor-pointer",
                    isFocused && "ring-2 ring-primary-500 ring-offset-2",
                    orientation === "horizontal" &&
                      "flex-row-reverse justify-between"
                  )}
                />
                {option.description && (
                  <p className="ml-6 mt-1 text-sm text-warm-gray-500">
                    {option.description}
                  </p>
                )}
              </div>
            );
          })}
        </Stack>
        {error && (
          <p className="mt-1.5 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

RadioGroup.displayName = "RadioGroup";

export { RadioGroup };

