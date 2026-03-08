/**
 * Centralized error handling hook
 * Provides consistent error handling with toast notifications
 */

import { useCallback } from "react";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/api/error-handler";

/**
 * Hook that provides a centralized error handler function
 * Uses extractErrorMessage utility and toast for consistent error display
 *
 * @returns A function to handle errors with toast notifications
 */
export function useErrorHandler() {
  return useCallback((error: unknown, fallback?: string) => {
    const message = extractErrorMessage(error, fallback);
    toast.error(message);
  }, []);
}
