// Stack component for consistent vertical spacing.
import { cn } from "@/lib/utils/cn";

interface StackProps {
  children: React.ReactNode;
  className?: string;
  spacing?: "xs" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch";
}

const spacingClasses = {
  xs: "space-y-1",
  sm: "space-y-2",
  md: "space-y-4",
  lg: "space-y-6",
  xl: "space-y-8",
};

const alignClasses = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

export function Stack({
  children,
  className,
  spacing = "md",
  align = "stretch",
}: StackProps) {
  return (
    <div
      className={cn(
        "flex flex-col",
        spacingClasses[spacing],
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
}

