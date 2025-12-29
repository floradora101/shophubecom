import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Shared skeleton block component for consistent loading states
 * - Visible neutral blocks (bg-gray-200/80) - NOT bg-muted/70 which is too faint
 * - Built-in shimmer animation overlay
 * - Accepts className and HTML div props for flexibility
 */
export function SkeletonBlock({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gray-200/80 rounded-lg",
        className
      )}
      aria-hidden="true"
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    </div>
  );
}

/**
 * Skeleton circle wrapper around SkeletonBlock
 */
export function SkeletonCircle({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <SkeletonBlock className={cn("rounded-full", className)} {...props} />;
}

/**
 * Skeleton text lines component for multiple lines of text
 */
interface SkeletonTextProps extends HTMLAttributes<HTMLDivElement> {
  lines?: number;
  lineHeight?: string;
}

export function SkeletonText({
  lines = 1,
  lineHeight = "h-4",
  className,
  ...props
}: SkeletonTextProps) {
  // Predefined width variations for the last line to create natural text flow
  const lastLineWidths = ["80%", "75%", "70%", "85%", "65%"];

  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }, (_, i) => (
        <SkeletonBlock
          key={i}
          className={lineHeight}
          style={{
            width:
              i === lines - 1
                ? lastLineWidths[i % lastLineWidths.length]
                : "100%",
          }}
        />
      ))}
    </div>
  );
}
