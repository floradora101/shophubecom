/**
 * Standardized API Request Wrappers
 *
 * Provides consistent request functions with automatic error handling and
 * response transformation. All API calls should use these wrappers for
 * consistent behavior across the application.
 *
 * Features:
 * - Automatic extraction of data from BackendResponse<T>
 * - Consistent error handling
 * - Type-safe responses
 * - Optional response transformation
 *
 * @see NEXT_REFACTORING_STRATEGIC_ROADMAP.md - Phase 3.3: API Layer Standardization
 */

import { AxiosError, AxiosRequestConfig } from "axios";
import { apiClient, type ExtendedAxiosRequestConfig } from "./client";
import type { BackendResponse, ApiError } from "@/lib/types/api";

/**
 * Extract error message from an API error
 */
function extractApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError | undefined;
    if (apiError?.message) {
      return apiError.message;
    }
    if (apiError?.errors && apiError.errors.length > 0) {
      return apiError.errors[0];
    }
    return error.message || "An error occurred";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

/**
 * Standardized GET request wrapper
 * Automatically extracts data from BackendResponse<T>
 *
 * @param url - API endpoint URL
 * @param config - Axios request config
 * @returns Extracted data from BackendResponse
 */
export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig & ExtendedAxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.get<BackendResponse<T>>(url, config);

    if (!response.data.success) {
      throw new Error("API request failed");
    }

    return response.data.data;
  } catch (error) {
    const message = extractApiErrorMessage(error);
    throw new Error(message);
  }
}

/**
 * Standardized POST request wrapper
 * Automatically extracts data from BackendResponse<T>
 *
 * @param url - API endpoint URL
 * @param data - Request body data
 * @param config - Axios request config
 * @returns Extracted data from BackendResponse
 */
export async function apiPost<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig & ExtendedAxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.post<BackendResponse<T>>(url, data, config);

    if (!response.data.success) {
      throw new Error("API request failed");
    }

    return response.data.data;
  } catch (error) {
    const message = extractApiErrorMessage(error);
    throw new Error(message);
  }
}

/**
 * Standardized PUT request wrapper
 * Automatically extracts data from BackendResponse<T>
 *
 * @param url - API endpoint URL
 * @param data - Request body data
 * @param config - Axios request config
 * @returns Extracted data from BackendResponse
 */
export async function apiPut<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig & ExtendedAxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.put<BackendResponse<T>>(url, data, config);

    if (!response.data.success) {
      throw new Error("API request failed");
    }

    return response.data.data;
  } catch (error) {
    const message = extractApiErrorMessage(error);
    throw new Error(message);
  }
}

/**
 * Standardized PATCH request wrapper
 * Automatically extracts data from BackendResponse<T>
 *
 * @param url - API endpoint URL
 * @param data - Request body data
 * @param config - Axios request config
 * @returns Extracted data from BackendResponse
 */
export async function apiPatch<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig & ExtendedAxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.patch<BackendResponse<T>>(url, data, config);

    if (!response.data.success) {
      throw new Error("API request failed");
    }

    return response.data.data;
  } catch (error) {
    const message = extractApiErrorMessage(error);
    throw new Error(message);
  }
}

/**
 * Standardized DELETE request wrapper
 * Automatically extracts data from BackendResponse<T>
 *
 * @param url - API endpoint URL
 * @param config - Axios request config
 * @returns Extracted data from BackendResponse
 */
export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig & ExtendedAxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.delete<BackendResponse<T>>(url, config);

    if (!response.data.success) {
      throw new Error("API request failed");
    }

    return response.data.data;
  } catch (error) {
    const message = extractApiErrorMessage(error);
    throw new Error(message);
  }
}

/**
 * Standardized GET request with query parameters
 * Automatically extracts data from BackendResponse<T>
 *
 * @param url - API endpoint URL
 * @param params - Query parameters
 * @param config - Additional Axios request config
 * @returns Extracted data from BackendResponse
 */
export async function apiGetWithParams<T, P = Record<string, unknown>>(
  url: string,
  params?: P,
  config?: AxiosRequestConfig & ExtendedAxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.get<BackendResponse<T>>(url, {
      ...config,
      params,
    });

    if (!response.data.success) {
      throw new Error("API request failed");
    }

    return response.data.data;
  } catch (error) {
    const message = extractApiErrorMessage(error);
    throw new Error(message);
  }
}