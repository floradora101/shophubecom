// Container component for consistent max-width and centering
import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const containerVariants = cva("w-full mx-auto px-4 sm:px-6 lg:px-8", {
  variants: {
    size: {
      sm: "max-w-4xl",
      md: "max-w-6xl",
      lg: "max-w-7xl",
      xl: "max-w-screen-2xl",
      full: "max-w-full",
    },
    padding: {
      default: "",
      none: "",
    },
  },
  defaultVariants: {
    size: "lg",
    padding: "default",
  },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(containerVariants({ size, padding }), className)}
        {...props}
      />
    );
  }
);

Container.displayName = "Container";

export { Container, containerVariants };
