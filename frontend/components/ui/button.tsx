// Button component with variants and sizes.
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils/cn";
import { LoadingSpinner } from "./spinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 min-h-10 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary-600 text-white hover:bg-primary-500 active:bg-primary-500",
        secondary: "bg-surface-muted text-fg hover:bg-surface",
        outline:
          "bg-white border border-warm-gray-200 text-warm-gray-700 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-sm transition-all duration-200",
        ghost: "text-warm-gray-600 hover:bg-warm-gray-100 hover:text-warm-gray-900 transition-colors",
        destructive: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-700",
      },
      size: {
        default: "px-6 py-2",
        sm: "px-4 py-1.5",
        lg: "px-8 py-2.5",
        hero: "px-8 py-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading,
      asChild,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <LoadingSpinner size="sm" variant="inline" />
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
