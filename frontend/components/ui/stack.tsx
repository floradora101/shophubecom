// Stack component for consistent vertical spacing.
import { cn } from "@/lib/utils/cn";
import { ui, type StackSpacing } from "@/lib/ui-tokens";
import { cva, type VariantProps } from "class-variance-authority";

const stackVariants = cva("flex flex-col", {
  variants: {
    spacing: {
      xs: "space-y-2",
      sm: "space-y-3",
      md: "space-y-4",
      lg: "space-y-6",
      xl: "space-y-8",
      "2xl": "space-y-12",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    },
    direction: {
      vertical: "flex-col",
      horizontal: "flex-row",
    },
  },
  defaultVariants: {
    spacing: "md",
    align: "stretch",
    direction: "vertical",
  },
});

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {
  children: React.ReactNode;
}

export function Stack({
  children,
  className,
  spacing,
  align,
  direction,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(stackVariants({ spacing, align, direction }), className)}
      {...props}
    >
      {children}
    </div>
  );
}
