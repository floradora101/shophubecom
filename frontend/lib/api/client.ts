import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { ApiError } from "../types/auth.types";
import { emitAuthExpired } from "./authEvents";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Check if a URL is an auth endpoint that should NOT trigger token refresh on 401
 * These endpoints handle their own authentication flow.
 */
const AUTH_REFRESH_SKIP_PATHS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/me",
]);

const getPathFromUrl = (url?: string): string | null => {
  if (!url) return null;

  try {
    const fullUrl = url.startsWith("http")
      ? new URL(url)
      : new URL(url, API_URL);

    let path = fullUrl.pathname;

    // Normalize `/api/auth/...` to `/auth/...` to match our skip list
    if (path.startsWith("/api/")) {
      path = path.slice(4);
    }

    return path;
  } catch {
    return null;
  }
};

/**
 * Check if a URL has a token query parameter (guest order access)
 */
const hasTokenQueryParam = (url?: string): boolean => {
  if (!url) return false;

  try {
    const fullUrl = url.startsWith("http")
      ? new URL(url)
      : new URL(url, API_URL);
    return fullUrl.searchParams.has("token");
  } catch {
    return false;
  }
};

const isAuthEndpoint = (url?: string): boolean => {
  const path = getPathFromUrl(url);
  if (!path) return false;

  return AUTH_REFRESH_SKIP_PATHS.has(path);
};

/**
 * Extended Axios request config with custom flags
 */
export interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
}

/**
 * Axios instance configured for API calls
 * - Includes credentials (cookies) for authentication
 * - Has interceptors for automatic token refresh
 */
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Required for httpOnly cookies
  timeout: 30000, // 30 second timeout
});

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

async function refreshRequest() {
  // Attempt to refresh token (refresh token is in httpOnly cookie)
  // Backend reads refresh token from cookie and sets new tokens in cookies.
  // Use plain axios to avoid triggering our own interceptor.
  // IMPORTANT: The refresh token cookie is now scoped to path: '/' (available on all routes)
  // so it will be sent with requests to any path.
  return axios.post(
    `${API_URL}/auth/refresh`,
    {},
    {
      withCredentials: true, // Required to send/receive cookies
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 * Response interceptor for automatic token refresh
 * - Intercepts 401 errors (unauthorized)
 * - Attempts to refresh token using refresh token from cookies
 * - Retries original request after successful refresh
 * - Queues multiple requests during refresh to prevent race conditions
 * - Skips refresh for auth endpoints (login, register, refresh, logout, etc.)
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    // Skip refresh if:
    // 1. Already retried this request
    // 2. Explicitly marked to skip refresh
    // 3. Request URL matches auth endpoints
    // 4. Request has token query param (guest order access)
    // 5. No URL available
    if (
      originalRequest._retry ||
      originalRequest._skipAuthRefresh ||
      isAuthEndpoint(originalRequest.url) ||
      hasTokenQueryParam(originalRequest.url) ||
      !originalRequest.url
    ) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Only attempt refresh if we had a session (user was logged in before)
      // Check localStorage for hadSession flag
      let hadSession = false;
      try {
        if (typeof window !== "undefined") {
          const authStorage = localStorage.getItem("auth-storage");
          if (authStorage) {
            const parsed = JSON.parse(authStorage);
            hadSession = parsed?.state?.hadSession === true;
          }
        }
      } catch {
        // If parsing fails, assume no session
        hadSession = false;
      }

      if (!hadSession) {
        return Promise.reject(error);
      }

      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await refreshRequest();

        // Token refreshed successfully, new tokens are in httpOnly cookies
        // Process queued requests (they'll use the new cookies automatically)
        processQueue(null);
        isRefreshing = false;

        // Retry original request (will use new access token from cookie)
        return apiClient(originalRequest);
      } catch (refreshError) {
        const axiosError = refreshError as AxiosError;
        const status = axiosError.response?.status;

        // Only log error if it's not a 401/400 (expected for guests with no refresh token)
        if (status && status !== 401 && status !== 400) {
          console.error("[Auth] ❌ Token refresh failed:", {
            status,
            message: axiosError.message,
          });
        } else {
          // Guest user or no refresh token - this is expected
        }

        // Refresh failed - emit auth expired event and reject
        processQueue(refreshError as AxiosError);
        isRefreshing = false;

        // Emit auth expired event (decoupled from UI layer)
        // AuthProvider or app will handle clearing state and redirect
        // Only emit if refresh token is actually invalid (401/403) or missing (400)
        // Don't emit on network errors - let them propagate normally
        // Note: For guest users, this will be a 401/400, but we still emit to clear any stale state
        if (
          typeof window !== "undefined" &&
          status &&
          (status === 401 || status === 403 || status === 400)
        ) {
          emitAuthExpired();
        }

        return Promise.reject(refreshError);
      }
    }

    // For other errors, reject normally
    return Promise.reject(error);
  }
);

/**
 * Request interceptor (optional - for adding auth headers if needed)
 * Currently tokens are in httpOnly cookies, so no headers needed
 */
apiClient.interceptors.request.use(
  (config) => {
    // Tokens are in httpOnly cookies, automatically sent with requests
    // If you need to add Authorization header, do it here:
    // const token = getTokenFromCookie(); // if needed
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
