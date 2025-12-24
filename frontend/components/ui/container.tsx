// Container component for consistent max-width and centering
import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "lg", ...props }, ref) => {
    const sizeClasses = {
      sm: "max-w-4xl",
      md: "max-w-6xl",
      lg: "max-w-7xl",
      xl: "max-w-screen-2xl",
      full: "max-w-full",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "mx-auto px-4 sm:px-6 lg:px-8",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

Container.displayName = "Container";

export { Container };
