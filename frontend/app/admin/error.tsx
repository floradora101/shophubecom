/**
 * @file error.tsx
 *
 * Purpose:
 * Admin-specific error boundary for handling errors in admin routes.
 * Provides consistent error handling with admin-specific messaging.
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { logError } from "@/lib/errors/logger";
import { toAppError } from "@/lib/errors/utils";

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Log error with admin context
    const appError = toAppError(error, undefined, {
      digest: error.digest,
      route: "/admin",
      context: "admin_error_boundary",
    });

    logError(appError, {
      component: "AdminErrorBoundary",
      action: "admin_error",
      route: "/admin",
    });
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-warm-gray-50">
      <Card className="max-w-lg w-full p-8 border-warm-gray-200 shadow-xl">
        <div className="text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-red-100 p-4">
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
          </div>

          {/* Error Code */}
          {error.digest && (
            <div className="mb-2">
              <Text className="text-xs font-mono font-semibold text-red-600">
                Error: {error.digest}
              </Text>
            </div>
          )}

          {/* Title */}
          <Heading level="h2" className="mb-3 text-warm-gray-900">
            Something Went Wrong
          </Heading>

          {/* Description */}
          <Text className="mb-8 text-warm-gray-600">
            An error occurred while loading the admin area. This might be due to a
            temporary issue or a problem with your connection. Please try again.
          </Text>

          {/* Error Message (for debugging, can be removed in production) */}
          {process.env.NODE_ENV === "development" && error.message && (
            <div className="mb-6 p-3 bg-warm-gray-100 rounded-lg text-left">
              <Text className="text-xs font-mono text-warm-gray-700 break-all">
                {error.message}
              </Text>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={reset}
              className="rounded-lg bg-primary-600 hover:bg-primary-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="rounded-lg"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
