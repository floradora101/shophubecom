// Grid component for consistent grid layouts.
import { cn } from "@/lib/utils/cn";

interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
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
  xs: "gap-2",
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-10",
};

export function Grid({ children, className, cols = 3, gap = "md" }: GridProps) {
  return (
    <div className={cn("grid", colsClasses[cols], gapClasses[gap], className)}>
      {children}
    </div>
  );
}

