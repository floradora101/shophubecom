// Grid component for consistent grid layouts.
import { cn } from "@/lib/utils/cn";
import { ui, type GapSpacing } from "@/lib/ui-tokens";

interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: GapSpacing;
}

const colsClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
  12: "grid-cols-12",
};

const gapClasses = {
  "1.5": ui.gap["1.5"],
  "2.5": ui.gap["2.5"],
  xs: ui.gap.xs,
  sm: ui.gap.sm,
  md: ui.gap.md,
  lg: ui.gap.lg,
  xl: ui.gap.xl,
  "2xl": ui.gap["2xl"],
};

export function Grid({ children, className, cols = 3, gap = "md" }: GridProps) {
  return (
    <div className={cn("grid", colsClasses[cols], gapClasses[gap], className)}>
      {children}
    </div>
  );
}
