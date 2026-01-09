import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils/cn";

/**
 * ErrorState - Reusable error state component for route-level errors
 *
 * Features:
 * - Consistent error UI across the app
 * - Retry functionality support
 * - Navigation options (home, back)
 * - Accessible error messaging
 * - Customizable actions and messaging
 */

export interface ErrorStateProps {
  /** Error title */
  title?: string;
  /** Error description */
  description?: string;
  /** Error code (e.g., "404", "500") */
  code?: string;
  /** Custom icon component */
  icon?: React.ComponentType<{ className?: string }>;
  /** Retry action */
  onRetry?: () => void;
  /** Retry button text */
  retryText?: string;
  /** Custom actions (replaces default buttons) */
  actions?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: {
    container: "py-8",
    icon: "h-8 w-8",
    title: "text-lg",
    description: "text-sm",
    code: "text-xs",
  },
  md: {
    container: "py-12",
    icon: "h-12 w-12",
    title: "text-xl",
    description: "text-base",
    code: "text-sm",
  },
  lg: {
    container: "py-16",
    icon: "h-16 w-16",
    title: "text-2xl",
    description: "text-lg",
    code: "text-base",
  },
};

export function ErrorState({
  title = "Something went wrong",
  description = "We're having trouble loading this page. Please try again.",
  code,
  icon: Icon = AlertTriangle,
  onRetry,
  retryText = "Try Again",
  actions,
  className,
  size = "md",
}: ErrorStateProps) {
  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizes.container,
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Error Icon */}
      <div className="mb-6">
        <Icon
          className={cn(
            "text-red-500",
            sizes.icon
          )}
          aria-hidden="true"
        />
      </div>

      {/* Error Code (if provided) */}
      {code && (
        <div className={cn(
          "mb-2 font-mono font-semibold text-red-600",
          sizes.code
        )}>
          {code}
        </div>
      )}

      {/* Error Title */}
      <h1 className={cn(
        "mb-3 font-semibold text-gray-900",
        sizes.title
      )}>
        {title}
      </h1>

      {/* Error Description */}
      <p className={cn(
        "mb-8 max-w-md text-gray-600",
        sizes.description
      )}>
        {description}
      </p>

      {/* Actions */}
      {actions ? (
        actions
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          {onRetry && (
            <Button onClick={onRetry} variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              {retryText}
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Common error state variants for specific use cases
 */

export function ErrorState404({
  onRetry,
  className,
  ...props
}: Omit<ErrorStateProps, "title" | "description" | "code">) {
  return (
    <ErrorState
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved."
      code="404"
      onRetry={onRetry}
      className={className}
      {...props}
    />
  );
}

export function ErrorState500({
  onRetry,
  className,
  ...props
}: Omit<ErrorStateProps, "title" | "description" | "code">) {
  return (
    <ErrorState
      title="Server Error"
      description="Something went wrong on our end. We're working to fix this."
      code="500"
      onRetry={onRetry}
      className={className}
      {...props}
    />
  );
}

export function ErrorStateNetwork({
  onRetry,
  className,
  ...props
}: Omit<ErrorStateProps, "title" | "description" | "code">) {
  return (
    <ErrorState
      title="Connection Error"
      description="Unable to connect to our servers. Please check your internet connection and try again."
      onRetry={onRetry}
      retryText="Retry Connection"
      className={className}
      {...props}
    />
  );
}
