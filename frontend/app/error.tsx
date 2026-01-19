/**
 * Root Error Page
 *
 * Next.js error page for handling unhandled errors at the app level.
 * This is a fallback when no route-specific error boundary catches the error.
 */

"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { logError } from "@/lib/errors/logger";
import { toAppError } from "@/lib/errors/utils";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error with context
    const appError = toAppError(error, undefined, {
      digest: error.digest,
    });

    logError(appError, {
      component: "RootErrorPage",
      action: "unhandled_error",
    });
  }, [error]);

  return (
    <ErrorState
      title="Something went wrong"
      description="An unexpected error occurred. Please try again or refresh the page."
      code={error.digest}
      onRetry={reset}
      retryText="Try Again"
    />
  );
}
