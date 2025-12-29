"use client";

import { cn } from "@/lib/utils/cn";

interface DotIndicatorProps {
  /** Total number of dots */
  count: number;
  /** Currently active dot index */
  activeIndex: number;
  /** Click handler for dot selection */
  onSelect: (index: number) => void;
  /** Shape variant */
  shape?: "circle" | "bar";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const sizeVariants = {
  sm: {
    circle: {
      active: "w-2.5 h-2.5",
      inactive: "w-2 h-2",
    },
    bar: {
      active: "w-6 h-2",
      inactive: "w-2 h-2",
    },
  },
  md: {
    circle: {
      active: "w-3 h-3",
      inactive: "w-2.5 h-2.5",
    },
    bar: {
      active: "w-8 h-2",
      inactive: "w-2 h-2",
    },
  },
  lg: {
    circle: {
      active: "w-4 h-4",
      inactive: "w-3 h-3",
    },
    bar: {
      active: "w-12 h-2.5",
      inactive: "w-2.5 h-2.5",
    },
  },
};

export function DotIndicator({
  count,
  activeIndex,
  onSelect,
  shape = "circle",
  size = "md",
  disabled = false,
  className,
}: DotIndicatorProps) {
  if (disabled || count <= 1) return null;

  const sizes = sizeVariants[size][shape];

  return (
    <div className={cn("flex justify-center items-center gap-2", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          disabled={disabled}
          className={cn(
            "transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed",
            shape === "circle" && "rounded-full",
            index === activeIndex
              ? cn(sizes.active, "bg-primary-500 shadow-lg")
              : cn(
                  sizes.inactive,
                  "bg-primary-200 hover:bg-primary-400 hover:scale-110"
                )
          )}
          aria-label={`Go to item ${index + 1} of ${count}`}
          aria-current={index === activeIndex ? "true" : "false"}
        />
      ))}
    </div>
  );
}

DotIndicator.displayName = "DotIndicator";
