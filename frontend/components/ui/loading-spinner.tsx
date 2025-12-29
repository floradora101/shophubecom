/**
 * Reusable loading spinner component
 * Provides consistent loading UI across the application
 */

import { cn } from "@/lib/utils/cn";
import { SkeletonBlock, SkeletonText } from "@/components/ui/skeleton";
import type { ComponentType } from "react";

/**
 * Progressive skeleton grid with staggered shimmer animations
 * Creates a more natural loading experience with cascading effects
 */
interface ProgressiveSkeletonGridProps {
  count: number;
  className?: string;
  itemComponent?: ComponentType;
  gridCols?: string;
}

export function ProgressiveSkeletonGrid({
  count,
  className = "",
  itemComponent: ItemComponent,
  gridCols = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
}: ProgressiveSkeletonGridProps) {
  return (
    <div className={cn("grid w-full gap-4 md:gap-6", gridCols, className)}>
      {Array.from({ length: count }, (_, i) => {
        if (ItemComponent) {
          return <ItemComponent key={i} />;
        }

        // Default skeleton item if no component provided - now uses SkeletonBlock
        return (
          <div key={i} className="flex flex-col space-y-3">
            <SkeletonBlock className="aspect-square w-full rounded-lg" />
            <div className="space-y-2">
              <SkeletonBlock className="h-4 rounded" />
              <SkeletonBlock className="h-4 rounded w-3/4" />
              <SkeletonBlock className="h-3 rounded w-1/2" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

type LoadingSpinnerSize = "sm" | "md" | "lg";
type LoadingSpinnerVariant = "full" | "inline" | "card";

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
  size?: LoadingSpinnerSize;
  variant?: LoadingSpinnerVariant;
}

const sizeClasses: Record<
  LoadingSpinnerSize,
  { outer: string; inner: string }
> = {
  sm: { outer: "h-4 w-4", inner: "h-2 w-2" },
  md: { outer: "h-8 w-8", inner: "h-4 w-4" },
  lg: { outer: "h-12 w-12", inner: "h-6 w-6" },
};

export function LoadingSpinner({
  message,
  className = "",
  size = "md",
  variant = "card",
}: LoadingSpinnerProps) {
  const sizes = sizeClasses[size];

  // Creative spinner with gradient ring and pulsing center
  const spinner = (
    <div
      className="relative inline-flex items-center justify-center"
      aria-label="Loading"
      role="status"
    >
      {/* Outer rotating gradient ring */}
      <div
        className={cn(
          "rounded-full animate-spin",
          sizes.outer,
          "border-4 border-transparent"
        )}
        style={{
          background: `conic-gradient(
            from 0deg,
            #dc2626 0deg,
            #b91c1c 90deg,
            #991b1b 180deg,
            #b91c1c 270deg,
            #dc2626 360deg
          )`,
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 4px), white calc(100% - 4px))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), white calc(100% - 4px))",
        }}
      />
      {/* Inner pulsing dot for visual depth */}
      <div
        className={cn(
          "absolute rounded-full bg-primary-500 animate-pulse",
          sizes.inner
        )}
      />
    </div>
  );

  // Inline variant - spinner with optional message
  if (variant === "inline") {
    return (
      <span className={cn("inline-flex items-center gap-2", className)}>
        {spinner}
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </span>
    );
  }

  // Full page variant - centered on page
  if (variant === "full") {
    return (
      <div
        className={cn(
          "flex min-h-screen items-center justify-center",
          className
        )}
      >
        <div className="text-center">
          {spinner}
          {message && <p className="mt-4 text-gray-600">{message}</p>}
        </div>
      </div>
    );
  }

  // Card variant (default) - no borders, just the spinner
  return (
    <div className={cn("flex items-center justify-center p-12", className)}>
      {spinner}
      {message && <p className="ml-3 text-sm text-gray-600">{message}</p>}
    </div>
  );
}

/**
 * Responsive skeleton component that adapts to screen size
 * Uses utility classes for consistent sizing across breakpoints
 */
interface ResponsiveSkeletonProps {
  variant?: "text" | "image" | "card" | "button" | "avatar";
  size?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  lines?: number;
  className?: string;
}

export function ResponsiveSkeleton({
  variant = "text",
  size = "base",
  lines = 1,
  className = "",
}: ResponsiveSkeletonProps) {
  if (variant === "image") {
    return (
      <SkeletonBlock
        className={`${className} skeleton-aspect-square`}
        style={{ width: "100%" }}
      />
    );
  }

  if (variant === "card") {
    return (
      <div className={`p-4 border border-warm-gray-200 ${className}`}>
        {/* Card image */}
        <SkeletonBlock className="skeleton-aspect-card rounded mb-3" />

        {/* Card content */}
        <div className="space-y-2">
          <SkeletonBlock className="skeleton-text-lg skeleton-w-mobile rounded" />
          <SkeletonBlock className="skeleton-text-base skeleton-w-mobile rounded" />
          <SkeletonBlock className="skeleton-text-sm skeleton-w-mobile rounded" />
        </div>
      </div>
    );
  }

  if (variant === "button") {
    return <SkeletonBlock className={`h-10 skeleton-w-mobile ${className}`} />;
  }

  if (variant === "avatar") {
    return <SkeletonBlock className={`w-10 h-10 rounded-full ${className}`} />;
  }

  // Default text variant
  if (lines === 1) {
    return (
      <SkeletonBlock
        className={`skeleton-text-${size} skeleton-w-mobile ${className}`}
      />
    );
  }

  return (
    <div className="skeleton-spacing-normal">
      {Array.from({ length: lines }, (_, i) => (
        <SkeletonBlock
          key={i}
          className={`skeleton-text-${size} skeleton-w-mobile rounded`}
          style={{
            width: i === lines - 1 ? "60%" : "100%", // Last line shorter
          }}
        />
      ))}
    </div>
  );
}

/**
 * Filters sidebar skeleton for products page
 * Mimics the structure of the filters sidebar during loading
 */
export function FiltersSidebarSkeleton() {
  return (
    <div className="relative bg-white/80 backdrop-blur-xl rounded-lg p-8 shadow-lg border border-warm-gray-200/50">
      <div className="mb-6">
        <SkeletonBlock className="h-6 w-3/4 mb-2" />
        <SkeletonBlock className="h-4 w-1/2" />
      </div>

      {/* Category section skeleton */}
      <div className="space-y-3 mb-8">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-5/6 ml-4" />
        <SkeletonBlock className="h-4 w-4/6 ml-4" />
        <SkeletonBlock className="h-4 w-full ml-8" />
        <SkeletonBlock className="h-4 w-3/4 ml-8" />
        <SkeletonBlock className="h-4 w-5/6" />
        <SkeletonBlock className="h-4 w-2/3 ml-4" />
      </div>

      {/* Price range section skeleton */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <SkeletonBlock className="w-4 h-4 rounded" />
          <SkeletonBlock className="h-4 w-24" />
        </div>

        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-20" />
          <div className="grid grid-cols-1 gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <SkeletonBlock key={i} className="h-8 rounded-lg" />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-24" />
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-8 flex-1 rounded" />
            <SkeletonBlock className="h-8 flex-1 rounded" />
          </div>
          <SkeletonBlock className="h-8 w-full rounded" />
        </div>
      </div>

      {/* Availability section skeleton */}
      <div>
        <SkeletonBlock className="h-4 w-20 mb-4" />
        <div className="flex items-center gap-3">
          <SkeletonBlock className="w-4 h-4 rounded" />
          <SkeletonBlock className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * Table skeleton for admin data tables
 * Creates skeleton rows with proper table structure
 */
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
  showHeader?: boolean;
}

export function TableSkeleton({
  rows = 5,
  columns = 6,
  className = "",
  showHeader = true,
}: TableSkeletonProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {showHeader && (
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: columns }, (_, i) => (
                  <th key={i} className="px-6 py-3">
                    <SkeletonBlock className="skeleton-text-sm skeleton-w-mobile rounded h-4" />
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-gray-200 bg-white">
            {Array.from({ length: rows }, (_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }, (_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    {colIndex === 0 ? (
                      // First column - more content (like product name + details)
                      <div className="space-y-1">
                        <SkeletonBlock className="skeleton-text-base skeleton-w-mobile rounded" />
                        <SkeletonBlock
                          className="skeleton-text-sm skeleton-w-mobile rounded"
                          style={{ width: "70%" }}
                        />
                      </div>
                    ) : colIndex === columns - 1 ? (
                      // Last column - action buttons
                      <div className="flex gap-2">
                        <SkeletonBlock className="w-8 h-8 rounded" />
                        <SkeletonBlock className="w-8 h-8 rounded" />
                      </div>
                    ) : (
                      // Other columns - simple text
                      <SkeletonBlock className="skeleton-text-sm skeleton-w-mobile rounded" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
