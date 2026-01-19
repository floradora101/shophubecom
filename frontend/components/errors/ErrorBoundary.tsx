/**
 * @file ErrorBoundary.tsx
 *
 * Error Boundary Component
 *
 * Purpose:
 * React error boundary to catch and handle React component errors.
 * Prevents the entire app from crashing when a component throws an error.
 *
 * Usage:
 * - Wrap route components for route-level error boundaries
 * - Wrap app root for app-level error boundary
 * - Provides fallback UI and error logging
 */

"use client";

import React, { Component, type ReactNode } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { logError } from "@/lib/errors/logger";
import { toAppError, getUserMessage } from "@/lib/errors/utils";
import { ErrorSeverity } from "@/lib/errors/types";

interface ErrorBoundaryProps {
  /** Children to render */
  children: ReactNode;
  /** Fallback component (optional, uses ErrorState by default) */
  fallback?: ReactNode | ((error: Error) => ReactNode);
  /** Called when error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Component name for logging context */
  component?: string;
  /** Whether to reset error on children change */
  resetOnChange?: string | number;
  /** Custom error title */
  title?: string;
  /** Custom error description */
  description?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary class component
 *
 * Note: Error boundaries must be class components (React limitation)
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private previousResetKey: string | number | undefined;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
    this.previousResetKey = props.resetOnChange;
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error with context
    const appError = toAppError(error, undefined, {
      componentStack: errorInfo.componentStack,
      component: this.props.component,
    });

    logError(appError, {
      component: this.props.component || "ErrorBoundary",
      action: "component_did_catch",
      metadata: {
        errorInfo,
      },
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error if resetOnChange prop changed
    if (
      this.state.hasError &&
      this.props.resetOnChange !== undefined &&
      this.props.resetOnChange !== this.previousResetKey
    ) {
      this.setState({
        hasError: false,
        error: null,
      });
      this.previousResetKey = this.props.resetOnChange;
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback
      if (this.props.fallback) {
        if (typeof this.props.fallback === "function") {
          return this.props.fallback(this.state.error);
        }
        return this.props.fallback;
      }

      // Default fallback using ErrorState
      const userMessage = getUserMessage(this.state.error);

      return (
        <ErrorState
          title={this.props.title || "Something went wrong"}
          description={this.props.description || userMessage}
          onRetry={this.handleReset}
          retryText="Try Again"
        />
      );
    }

    return this.props.children;
  }
}

/**
 * App-level error boundary wrapper
 *
 * Catches errors in the entire application
 */
export function AppErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      component="App"
      title="Application Error"
      description="Something went wrong. Please refresh the page or try again later."
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Route-level error boundary wrapper
 *
 * Catches errors in a specific route
 */
export function RouteErrorBoundary({
  children,
  route,
  ...props
}: Omit<ErrorBoundaryProps, "component"> & { route?: string }) {
  return (
    <ErrorBoundary component={route || "Route"} {...props}>
      {children}
    </ErrorBoundary>
  );
}
