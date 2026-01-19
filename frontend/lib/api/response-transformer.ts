/**
 * API Response Transformer
 *
 * Standardizes API response handling across all features.
 * Extracts data from BackendResponse<T> consistently.
 */

import type { BackendResponse } from "@/lib/types/api";
import type { AxiosResponse } from "axios";

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

  // Fallback: if data is directly in response (shouldn't happen but handle gracefully)
  throw new Error("Invalid API response structure");
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

  throw new Error("Invalid paginated API response structure");
}

/**
 * Extract data from nested paginated response
 * Some endpoints return: { data: { data: T[], meta: {...} }, meta: {...} }
 */
export function extractNestedPaginatedData<T>(
  response: AxiosResponse<BackendResponse<{
    data: T[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
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
    const { data, meta } = backendResponse.data;
    return {
      data,
      total: meta.total,
      page: meta.page,
      limit: meta.limit,
      totalPages: meta.totalPages,
    };
  }

  throw new Error("Invalid nested paginated API response structure");
}
