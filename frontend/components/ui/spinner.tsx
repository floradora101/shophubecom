import { cn } from "@/lib/utils/cn";

type LoadingSpinnerSize = "xs" | "sm" | "md" | "lg";
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
  xs: { outer: "h-3 w-3", inner: "h-1.5 w-1.5" },
  sm: { outer: "h-4 w-4", inner: "h-2 w-2" },
  md: { outer: "h-8 w-8", inner: "h-4 w-4" },
  lg: { outer: "h-12 w-12", inner: "h-6 w-6" },
};

/**
 * Canonical loading spinner component for consistent loading UI
 * Use for indeterminate loading states (when you don't know how long loading will take)
 */
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
            #b91c1c 180deg,
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
  // suppressHydrationWarning: loading messages can differ between server/client when
  // auth/route guards resolve at different times (e.g. RequireAdmin bootstrap)
  if (variant === "inline") {
    return (
      <span className={cn("inline-flex items-center gap-2", className)}>
        {spinner}
        {message && (
          <span className="text-sm text-gray-600" suppressHydrationWarning>
            {message}
          </span>
        )}
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




