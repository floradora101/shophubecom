/**
 * API Response Transformer
 *
 * Standardizes API response handling across all features.
 * Extracts data from BackendResponse<T> consistently.
 */

import type { BackendResponse } from "@/lib/types/api";
import type { AxiosResponse } from "axios";

/** Error thrown when response structure is invalid; includes cause for debugging */
export class InvalidResponseError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly url?: string,
    public readonly responseData?: unknown
  ) {
    super(message);
    this.name = "InvalidResponseError";
  }
}

/**
 * Extract data from BackendResponse
 * Handles both direct data and nested data structures
 */
export function extractResponseData<T>(
  response: AxiosResponse<BackendResponse<T>>
): T {
  const backendResponse = response.data;

  // BackendResponse structure: { success: boolean, data: T, timestamp: string }
  if (backendResponse.success && backendResponse.data !== undefined) {
    return backendResponse.data;
  }

  throw new InvalidResponseError(
    "Invalid API response structure: missing or invalid data",
    response.status,
    response.config?.url,
    backendResponse
  );
}

/**
 * Extract data from paginated BackendResponse
 * Handles nested pagination structures
 */
export function extractPaginatedData<T>(
  response: AxiosResponse<BackendResponse<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>>
): {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const backendResponse = response.data;

  if (backendResponse.success && backendResponse.data) {
    return backendResponse.data;
  }

  throw new InvalidResponseError(
    "Invalid paginated API response structure: missing or invalid data",
    response.status,
    response.config?.url,
    backendResponse
  );
}
