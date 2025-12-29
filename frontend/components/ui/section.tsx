// Section component for consistent spacing and layout
import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";
import { Container } from "./container";
import { ui, type SectionSpacing } from "@/lib/ui-tokens";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: SectionSpacing;
  containerSize?: "sm" | "md" | "lg" | "xl" | "full";
  withContainer?: boolean;
}

const Section = forwardRef<HTMLElement, SectionProps>(
  (
    {
      className,
      spacing = "lg",
      containerSize = "lg",
      withContainer = true,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <section
        ref={ref}
        className={cn("w-full", ui.sectionY[spacing], className)}
        {...props}
      >
        {withContainer ? (
          <Container size={containerSize}>{children}</Container>
        ) : (
          children
        )}
      </section>
    );
  }
);

Section.displayName = "Section";

export { Section };
