// FormSection component - thin wrapper for form sections
import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Heading, Text } from "./typography";
import { Stack } from "./stack";
import { type StackSpacing } from "@/lib/ui-tokens";

export interface FormSectionProps {
  /** Section title */
  title: string;
  /** Optional section description */
  description?: string;
  /** Section content */
  children: React.ReactNode;
  /** Whether to show a divider after the section */
  showDivider?: boolean;
  /** Optional actions to show on the right side of header */
  actions?: React.ReactNode;
  /** Spacing between header and content */
  spacing?: StackSpacing;
  /** Additional className for the root section */
  className?: string;
  /** Additional className for the header */
  headerClassName?: string;
  /** Additional className for the content */
  contentClassName?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  showDivider = false,
  actions,
  spacing = "md",
  className,
  headerClassName,
  contentClassName,
}) => {
  return (
    <section className={className}>
      <Stack spacing={spacing}>
        {/* Header */}
        <div
          className={cn(
            "flex items-start justify-between gap-4",
            headerClassName
          )}
        >
          <div className="flex-1 min-w-0">
            <Stack spacing="xs">
              <Heading level="h5">{title}</Heading>
              {description && (
                <Text variant="meta" className="text-warm-gray-600">
                  {description}
                </Text>
              )}
            </Stack>
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>

        {/* Content */}
        <div className={contentClassName}>{children}</div>
      </Stack>

      {showDivider && (
        <hr className="border-warm-gray-200 mt-6" aria-hidden="true" />
      )}
    </section>
  );
};

export { FormSection };
