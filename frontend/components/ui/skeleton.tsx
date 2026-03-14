import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Shared skeleton block component for consistent loading states.
 * Production-ready: visible neutral fill, optional shimmer, a11y, reduced-motion safe.
 * - Use SkeletonBlock for all skeleton UI; avoid raw bg-gray-* + animate-pulse.
 * - aria-hidden so screen readers can skip decorative loading placeholders.
 */
export function SkeletonBlock({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton-block relative overflow-hidden rounded-lg bg-gray-200/80", className)}
      aria-hidden="true"
      data-skeleton
      {...props}
    >
      <div
        className="skeleton-shimmer absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/50 to-transparent animate-shimmer"
        aria-hidden="true"
      />
    </div>
  );
}

export { SkeletonBlock as Skeleton };

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
