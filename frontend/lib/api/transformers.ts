/**
 * API Response Transformers
 *
 * Common transformation utilities for API responses.
 * These functions help normalize and transform backend data structures
 * into frontend-appropriate formats.
 *
 * @see NEXT_REFACTORING_STRATEGIC_ROADMAP.md - Phase 3.3: API Layer Standardization
 */

import type { AxiosError } from "axios";
import type { ApiError } from "@/lib/types/api";

/**
 * Extract error message from an API error
 */
function extractApiErrorMessage(error: unknown): string {
  if (error instanceof Error && "response" in error) {
    const axiosError = error as AxiosError<ApiError>;
    const apiError = axiosError.response?.data;
    if (apiError?.message) {
      return apiError.message;
    }
    if (apiError?.errors && apiError.errors.length > 0) {
      return apiError.errors[0];
    }
    return axiosError.message || "An error occurred";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

/**
 * Paginated response structure from backend.
 * Use extractPaginatedData from response-transformer for API responses.
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Transform array response with optional item transformation
 *
 * @param items - Array of items to transform
 * @param transform - Transform function for each item
 * @returns Transformed array
 */
export function transformArray<T, R>(
  items: T[],
  transform: (item: T) => R
): R[] {
  if (!Array.isArray(items)) return [];
  return items.map(transform);
}

/**
 * Normalize date strings in an object
 * Converts date strings to Date objects or keeps as strings based on options
 *
 * @param obj - Object to normalize
 * @param dateFields - Array of field names that contain dates
 * @param toDate - If true, converts to Date objects; if false, keeps as strings
 * @returns Normalized object
 */
export function normalizeDates<T extends Record<string, unknown>>(
  obj: T,
  dateFields: (keyof T)[],
  toDate: boolean = false
): T {
  const normalized = { ...obj };

  dateFields.forEach((field) => {
    const value = normalized[field];
    if (value && typeof value === "string") {
      normalized[field] = (toDate ? new Date(value) : value) as T[keyof T];
    }
  });

  return normalized;
}

/**
 * Pick and transform specific fields from an object
 *
 * @param obj - Source object
 * @param fields - Map of source field names to transformed field names and transformers
 * @returns Transformed object
 */
export function pickAndTransform<
  T extends Record<string, unknown>,
  R extends Record<string, unknown>
>(
  obj: T,
  fields: {
    [K in keyof R]?: {
      from: keyof T;
      transform?: (value: T[keyof T]) => R[K];
    };
  }
): R {
  const result = {} as R;

  Object.entries(fields).forEach(([targetKey, config]) => {
    const { from, transform } = config as {
      from: keyof T;
      transform?: (value: T[keyof T]) => unknown;
    };

    const value = obj[from];
    result[targetKey as keyof R] = transform
      ? (transform(value) as R[keyof R])
      : (value as unknown as R[keyof R]);
  });

  return result;
}

/**
 * Map object values with a transform function
 *
 * @param obj - Source object
 * @param transform - Transform function for values
 * @returns Object with transformed values
 */
export function mapObjectValues<T, R>(
  obj: Record<string, T>,
  transform: (value: T, key: string) => R
): Record<string, R> {
  const result: Record<string, R> = {};

  Object.entries(obj).forEach(([key, value]) => {
    result[key] = transform(value, key);
  });

  return result;
}

/**
 * Combine multiple objects with field mapping
 * Useful for combining related API responses
 *
 * @param sources - Array of source objects
 * @param fieldMap - Map of target fields to source object indices and field names
 * @returns Combined object
 */
export function combineObjects<T extends Record<string, unknown>>(
  sources: Record<string, unknown>[],
  fieldMap: {
    [K in keyof T]?: {
      sourceIndex: number;
      field: string;
      transform?: (value: unknown) => T[K];
    };
  }
): T {
  const result = {} as T;

  Object.entries(fieldMap).forEach(([targetKey, config]) => {
    const { sourceIndex, field, transform } = config as {
      sourceIndex: number;
      field: string;
      transform?: (value: unknown) => unknown;
    };

    const source = sources[sourceIndex];
    if (source) {
      const value = source[field];
      result[targetKey as keyof T] = transform
        ? (transform(value) as T[keyof T])
        : (value as T[keyof T]);
    }
  });

  return result;
}