/**
 * Reusable loading spinner component
 * Provides consistent loading UI across the application
 */

import { cn } from "@/lib/utils/cn";
import type { ComponentType } from "react";

/**
 * Progressive skeleton grid with staggered shimmer animations
 * Creates a more natural loading experience with cascading effects
 */
interface ProgressiveSkeletonGridProps {
  count: number;
  className?: string;
  itemComponent?: ComponentType<{ delayClass: string }>;
  gridCols?: string;
}

export function ProgressiveSkeletonGrid({
  count,
  className = "",
  itemComponent: ItemComponent,
  gridCols = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
}: ProgressiveSkeletonGridProps) {
  const delayClasses = [
    "animate-shimmer",
    "animate-shimmer-delay-100",
    "animate-shimmer-delay-200",
    "animate-shimmer-delay-300",
    "animate-shimmer-delay-400",
    "animate-shimmer-delay-500",
  ];

  return (
    <div className={cn("grid w-full gap-4 md:gap-6", gridCols, className)}>
      {Array.from({ length: count }, (_, i) => {
        const delayClass = delayClasses[i % delayClasses.length];

        if (ItemComponent) {
          return <ItemComponent key={i} delayClass={delayClass} />;
        }

        // Default skeleton item if no component provided
        return (
          <div key={i} className="flex flex-col space-y-3">
            <div
              className={cn("aspect-square w-full rounded-lg", delayClass)}
            />
            <div className="space-y-2">
              <div className={cn("h-4 rounded", delayClass)} />
              <div className={cn("h-4 rounded w-3/4", delayClass)} />
              <div className={cn("h-3 rounded w-1/2", delayClass)} />
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
  delayClass?: string;
}

export function ResponsiveSkeleton({
  variant = "text",
  size = "base",
  lines = 1,
  className = "",
  delayClass = "animate-shimmer",
}: ResponsiveSkeletonProps) {
  const baseClasses = `${delayClass} rounded ${className}`;

  if (variant === "image") {
    return (
      <div
        className={`${baseClasses} skeleton-aspect-square bg-current`}
        style={{ width: "100%" }}
      />
    );
  }

  if (variant === "card") {
    return (
      <div className={`${baseClasses} p-4 border border-warm-gray-200`}>
        {/* Card image */}
        <div
          className={`${delayClass} skeleton-aspect-card rounded mb-3 bg-current`}
        />

        {/* Card content */}
        <div className="space-y-2">
          <div
            className={`${delayClass} skeleton-text-lg skeleton-w-mobile rounded bg-current`}
          />
          <div
            className={`${delayClass} skeleton-text-base skeleton-w-mobile rounded bg-current`}
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className={`${delayClass} skeleton-text-sm skeleton-w-mobile rounded bg-current`}
            style={{ animationDelay: "0.2s" }}
          />
        </div>
      </div>
    );
  }

  if (variant === "button") {
    return (
      <div className={`${baseClasses} h-10 skeleton-w-mobile bg-current`} />
    );
  }

  if (variant === "avatar") {
    return (
      <div className={`${baseClasses} w-10 h-10 rounded-full bg-current`} />
    );
  }

  // Default text variant
  if (lines === 1) {
    return (
      <div
        className={`${baseClasses} skeleton-text-${size} skeleton-w-mobile bg-current`}
      />
    );
  }

  return (
    <div className="skeleton-spacing-normal">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`${delayClass} skeleton-text-${size} skeleton-w-mobile rounded bg-current`}
          style={{
            animationDelay: `${i * 0.1}s`,
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
        <div className="animate-shimmer h-6 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="animate-shimmer h-4 bg-gray-200 rounded w-1/2" />
      </div>

      {/* Category section skeleton */}
      <div className="space-y-3 mb-8">
        <div className="animate-shimmer h-4 bg-gray-200 rounded w-full" />
        <div className="animate-shimmer h-4 bg-gray-200 rounded w-5/6 ml-4" />
        <div className="animate-shimmer h-4 bg-gray-200 rounded w-4/6 ml-4" />
        <div className="animate-shimmer h-4 bg-gray-200 rounded w-full ml-8" />
        <div className="animate-shimmer h-4 bg-gray-200 rounded w-3/4 ml-8" />
        <div className="animate-shimmer h-4 bg-gray-200 rounded w-5/6" />
        <div className="animate-shimmer h-4 bg-gray-200 rounded w-2/3 ml-4" />
      </div>

      {/* Price range section skeleton */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="animate-shimmer w-4 h-4 bg-gray-200 rounded" />
          <div className="animate-shimmer h-4 bg-gray-200 rounded w-24" />
        </div>

        <div className="space-y-2">
          <div className="animate-shimmer h-3 bg-gray-200 rounded w-20" />
          <div className="grid grid-cols-1 gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="animate-shimmer h-8 bg-gray-200 rounded-lg"
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="animate-shimmer h-3 bg-gray-200 rounded w-24" />
          <div className="flex items-center gap-2">
            <div className="animate-shimmer h-8 bg-gray-200 rounded flex-1" />
            <div className="animate-shimmer h-8 bg-gray-200 rounded flex-1" />
          </div>
          <div className="animate-shimmer h-8 bg-gray-200 rounded w-full" />
        </div>
      </div>

      {/* Availability section skeleton */}
      <div>
        <div className="animate-shimmer h-4 bg-gray-200 rounded w-20 mb-4" />
        <div className="flex items-center gap-3">
          <div className="animate-shimmer w-4 h-4 bg-gray-200 rounded" />
          <div className="animate-shimmer h-4 bg-gray-200 rounded w-24" />
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
                    <div
                      className={`animate-shimmer skeleton-text-sm skeleton-w-mobile rounded bg-current h-4`}
                    />
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
                        <div
                          className={`animate-shimmer skeleton-text-base skeleton-w-mobile rounded bg-current`}
                          style={{ animationDelay: `${rowIndex * 0.05}s` }}
                        />
                        <div
                          className={`animate-shimmer skeleton-text-sm skeleton-w-mobile rounded bg-current`}
                          style={{
                            animationDelay: `${rowIndex * 0.05 + 0.1}s`,
                            width: "70%",
                          }}
                        />
                      </div>
                    ) : colIndex === columns - 1 ? (
                      // Last column - action buttons
                      <div className="flex gap-2">
                        <div
                          className={`animate-shimmer w-8 h-8 rounded bg-current`}
                          style={{
                            animationDelay: `${rowIndex * 0.05 + 0.2}s`,
                          }}
                        />
                        <div
                          className={`animate-shimmer w-8 h-8 rounded bg-current`}
                          style={{
                            animationDelay: `${rowIndex * 0.05 + 0.3}s`,
                          }}
                        />
                      </div>
                    ) : (
                      // Other columns - simple text
                      <div
                        className={`animate-shimmer skeleton-text-sm skeleton-w-mobile rounded bg-current`}
                        style={{
                          animationDelay: `${
                            rowIndex * 0.05 + colIndex * 0.05
                          }s`,
                        }}
                      />
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
