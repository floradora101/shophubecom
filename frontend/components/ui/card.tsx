// Card component for content containers
import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva("rounded-lg overflow-hidden bg-surface", {
  variants: {
    variant: {
      default: "border border-border",
      elevated:
        "border border-border shadow-md hover:shadow-lg transition-shadow duration-normal",
      bordered: "border-2 border-border",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "none",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding }), className)}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export { Card, cardVariants };
