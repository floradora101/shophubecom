// Card component for content containers
import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "bordered";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-white border border-neutral-200",
      elevated:
        "bg-white border border-neutral-200 shadow-md hover:shadow-lg transition-shadow duration-300",
      bordered: "bg-white border-2 border-neutral-300",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl overflow-hidden",
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export { Card };
