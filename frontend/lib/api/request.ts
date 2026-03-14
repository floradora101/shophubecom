/**
 * Standardized API Request Wrappers
 *
 * Provides consistent request functions with automatic error handling and
 * response transformation. All API calls should use these wrappers for
 * consistent behavior across the application.
 *
 * Features:
 * - Automatic extraction of data from BackendResponse<T>
 * - Consistent error handling (throws ApiRequestError with statusCode, errors)
 * - Type-safe responses
 *
 * @see NEXT_REFACTORING_STRATEGIC_ROADMAP.md - Phase 3.3: API Layer Standardization
 */

import { AxiosRequestConfig } from "axios";
import { apiClient } from "./client";

/** Config for API wrappers - AxiosRequestConfig plus optional custom flags */
export type ApiRequestConfig = AxiosRequestConfig & {
  _skipAuthRefresh?: boolean;
  _retry?: boolean;
};
import type { BackendResponse } from "@/lib/types/api";
import {
  extractErrorInfo,
  buildErrorInfoFromResponse,
  ApiRequestError,
} from "./error-handler";

export { ApiRequestError };

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
  config?: ApiRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.get<BackendResponse<T>>(url, config);

    if (!response.data.success) {
      const errorData = response.data as { message?: string | string[]; code?: string; errors?: string[] };
      const info = buildErrorInfoFromResponse(response.status, errorData);
      throw new ApiRequestError(info);
    }

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiRequestError) throw error;
    const info = extractErrorInfo(error);
    throw new ApiRequestError(info);
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
  config?: ApiRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.post<BackendResponse<T>>(url, data, config);

    if (!response.data.success) {
      const errorData = response.data as { message?: string | string[]; code?: string; errors?: string[] };
      const info = buildErrorInfoFromResponse(response.status, errorData);
      throw new ApiRequestError(info);
    }

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiRequestError) throw error;
    const info = extractErrorInfo(error);
    throw new ApiRequestError(info);
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
  config?: ApiRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.put<BackendResponse<T>>(url, data, config);

    if (!response.data.success) {
      const errorData = response.data as { message?: string | string[]; code?: string; errors?: string[] };
      const info = buildErrorInfoFromResponse(response.status, errorData);
      throw new ApiRequestError(info);
    }

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiRequestError) throw error;
    const info = extractErrorInfo(error);
    throw new ApiRequestError(info);
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
  config?: ApiRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.patch<BackendResponse<T>>(url, data, config);

    if (!response.data.success) {
      const errorData = response.data as { message?: string | string[]; code?: string; errors?: string[] };
      const info = buildErrorInfoFromResponse(response.status, errorData);
      throw new ApiRequestError(info);
    }

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiRequestError) throw error;
    const info = extractErrorInfo(error);
    throw new ApiRequestError(info);
  }
}

/**
 * Standardized DELETE request wrapper
 * Automatically extracts data from BackendResponse<T>
 * Handles 204 No Content (empty body) as success - backend DELETE endpoints return 204.
 *
 * @param url - API endpoint URL
 * @param config - Axios request config
 * @returns Extracted data from BackendResponse, or undefined for 204 No Content
 */
export async function apiDelete<T>(
  url: string,
  config?: ApiRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.delete<BackendResponse<T>>(url, config);

    // 204 No Content has no body - treat as success (backend DELETE endpoints use this)
    if (response.status === 204 || response.data == null) {
      return undefined as T;
    }

    if (!response.data.success) {
      const errorData = response.data as { message?: string | string[]; code?: string; errors?: string[] };
      const info = buildErrorInfoFromResponse(response.status, errorData);
      throw new ApiRequestError(info);
    }

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiRequestError) throw error;
    const info = extractErrorInfo(error);
    throw new ApiRequestError(info);
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
export async function apiGetWithParams<T, P extends object = object>(
  url: string,
  params?: P,
  config?: ApiRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.get<BackendResponse<T>>(url, {
      ...config,
      params,
    });

    if (!response.data.success) {
      const errorData = response.data as { message?: string | string[]; code?: string; errors?: string[] };
      const info = buildErrorInfoFromResponse(response.status, errorData);
      throw new ApiRequestError(info);
    }

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiRequestError) throw error;
    const info = extractErrorInfo(error);
    throw new ApiRequestError(info);
  }
}