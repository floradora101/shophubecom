// Section component for consistent spacing and layout
import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: "sm" | "md" | "lg" | "xl";
  containerSize?: "sm" | "md" | "lg" | "xl" | "full";
}

const Section = forwardRef<HTMLElement, SectionProps>(
  (
    { className, spacing = "lg", containerSize = "lg", children, ...props },
    ref
  ) => {
    const spacingClasses = {
      sm: "py-12",
      md: "py-16",
      lg: "py-20",
      xl: "py-24",
    };

    return (
      <section
        ref={ref}
        className={cn(spacingClasses[spacing], className)}
        {...props}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {children}
        </div>
      </section>
    );
  }
);

Section.displayName = "Section";

export { Section };
