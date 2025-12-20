import axios from "axios";
import type { ApiError } from "@/lib/types/api";

/**
 * Extracts a user-friendly error message from various error types.
 *
 * Handles:
 * - Axios errors with API response (extracts message from response.data.message)
 * - Axios errors with validation errors array (uses first error)
 * - Timeout errors (ECONNABORTED)
 * - Network/server down errors (no response)
 * - Standard Error instances
 * - Unknown error types (fallback message)
 *
 * @param error - The error to extract a message from
 * @param fallback - Optional fallback message if error cannot be extracted
 * @returns A user-friendly error message string
 */
export function extractErrorMessage(error: unknown, fallback?: string): string {
  if (axios.isAxiosError<ApiError>(error)) {
    // Timeout
    if (error.code === "ECONNABORTED") {
      return fallback || "Request timed out. Please try again.";
    }

    // No response = network/server down
    if (!error.response) {
      return (
        fallback ||
        "Cannot reach the server. Check your connection and try again."
      );
    }

    const data = error.response.data;

    // Validation array
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors[0];
    }

    return data?.message || fallback || "Request failed";
  }

  if (error instanceof Error)
    return error.message || fallback || "An error occurred";
  return fallback || "An unexpected error occurred";
}
