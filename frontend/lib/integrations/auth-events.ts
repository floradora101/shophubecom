/**
 * @file auth-events.ts
 *
 * Purpose:
 * Event system that decouples the network layer (Axios) from the UI layer (Zustand store).
 * Allows Axios interceptor to notify UI components when authentication expires without
 * creating circular dependencies between layers.
 *
 * Responsibilities:
 * - Provides onAuthExpired() to subscribe to auth expiration events
 * - Provides emitAuthExpired() to emit events when auth expires
 * - Supports multiple listeners via Set-based subscription system
 * - Prevents circular dependencies between lib/ and features/ directories
 *
 * How it fits into auth flow:
 * - Axios interceptor (in client.ts) calls emitAuthExpired() when token refresh fails
 * - AuthProvider (in features/auth/) subscribes via onAuthExpired(callback)
 * - When event fires, AuthProvider clears user state and redirects to login
 * - This allows network layer to notify UI without importing store/features
 *
 * Why this file exists:
 * - lib/api/client.ts (network layer) cannot import from store/ or features/ (layering violation)
 * - But Axios needs to notify UI when auth expires
 * - Solution: Event system - one-way flow from network → events → UI
 * - Maintains proper architectural layering (lib/ → features/ → store/)
 */

type AuthExpiredCallback = () => void;

const listeners = new Set<AuthExpiredCallback>();

/**
 * Subscribe to auth expiration events
 *
 * @param callback - Function to call when authentication expires
 * @returns Unsubscribe function to remove the listener
 *
 * @example
 * ```ts
 * const unsubscribe = onAuthExpired(() => {
 *   // Handle auth expiration
 * });
 * // Later...
 * unsubscribe();
 * ```
 */
export function onAuthExpired(callback: AuthExpiredCallback): () => void {
  listeners.add(callback);

  // Return unsubscribe function
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Emit auth expired event to all registered listeners
 * Called by Axios interceptor when token refresh fails
 */
export function emitAuthExpired() {
  // Call all listeners
  listeners.forEach((callback) => {
    try {
      callback();
    } catch (error) {
      // Don't break other listeners if one fails
    }
  });
}
