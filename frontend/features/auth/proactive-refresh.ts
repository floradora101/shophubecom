/**
 * @file proactive-refresh.ts
 *
 * Purpose:
 * Schedules token refresh before expiry to avoid 401 errors.
 * Uses expiresIn from auth responses to refresh proactively.
 *
 * Responsibilities:
 * - scheduleProactiveRefresh(expiresInSeconds) - schedules refresh ~60s before expiry
 * - cancelProactiveRefresh() - clears scheduled refresh (on logout)
 * - On refresh success: reschedules with new expiresIn from response
 * - Updates auth store with refreshed user data
 */

import { authApi } from "./api";
import { useAuthStore } from "@/store/auth-store";

let refreshTimeoutId: ReturnType<typeof setTimeout> | null = null;

/** Refresh 60 seconds before expiry to avoid race with actual expiry */
const REFRESH_BUFFER_SECONDS = 60;

/**
 * Schedule a proactive token refresh before the access token expires.
 * Call after login, register, bootstrap, or refresh when expiresIn is available.
 *
 * @param expiresInSeconds - Token lifetime in seconds (from backend)
 */
export function scheduleProactiveRefresh(expiresInSeconds: number): void {
  cancelProactiveRefresh();

  const delayMs = Math.max(1000, (expiresInSeconds - REFRESH_BUFFER_SECONDS) * 1000);

  refreshTimeoutId = setTimeout(async () => {
    refreshTimeoutId = null;
    try {
      const authData = await authApi.refresh();
      const { setUser } = useAuthStore.getState();
      if (authData.user) {
        setUser(authData.user);
      }
      if (authData.expiresIn) {
        scheduleProactiveRefresh(authData.expiresIn);
      }
    } catch {
      // Refresh failed - 401 interceptor will handle auth expiry
    }
  }, delayMs);
}

/**
 * Cancel any scheduled proactive refresh.
 * Call on logout or when clearing auth state.
 */
export function cancelProactiveRefresh(): void {
  if (refreshTimeoutId !== null) {
    clearTimeout(refreshTimeoutId);
    refreshTimeoutId = null;
  }
}
