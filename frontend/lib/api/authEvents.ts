/**
 * Auth Events Module
 *
 * Decouples network layer (Axios) from UI layer (Zustand store).
 * Allows Axios interceptor to emit auth expiration events without
 * directly importing the Zustand store.
 */

type AuthExpiredCallback = () => void;

let onAuthExpiredCallback: AuthExpiredCallback | null = null;

/**
 * Set callback to be called when authentication expires
 * Should be called once during app initialization (e.g., in AuthProvider)
 */
export function setOnAuthExpired(callback: AuthExpiredCallback) {
  onAuthExpiredCallback = callback;
}

/**
 * Clear the auth expired callback
 */
export function clearOnAuthExpired() {
  onAuthExpiredCallback = null;
}

/**
 * Emit auth expired event
 * Called by Axios interceptor when token refresh fails
 */
export function emitAuthExpired() {
  if (onAuthExpiredCallback) {
    onAuthExpiredCallback();
  }
}
