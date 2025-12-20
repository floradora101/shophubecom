/**
 * Shared API types
 * These types are used across the application and should not be feature-specific
 */

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  errors?: string[];
  timestamp: string;
}

/**
 * Standard backend response structure
 * Used consistently across all API endpoints
 */
export interface BackendResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}
