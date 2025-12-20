/**
 * Safe storage access utilities for form drafts
 * Handles SSR safely by checking for window availability
 */

export type StorageType = "session" | "local";

/**
 * Get the appropriate storage object based on type
 * Returns null if not available (SSR or storage disabled)
 */
export function getStorage(type: StorageType): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return type === "session" ? window.sessionStorage : window.localStorage;
  } catch (error) {
    // Storage might be disabled or unavailable
    return null;
  }
}

/**
 * Safely get an item from storage
 */
export function getStorageItem(key: string, type: StorageType): string | null {
  const storage = getStorage(type);
  if (!storage) return null;

  try {
    return storage.getItem(key);
  } catch (error) {
    return null;
  }
}

/**
 * Safely set an item in storage
 */
export function setStorageItem(
  key: string,
  value: string,
  type: StorageType
): boolean {
  const storage = getStorage(type);
  if (!storage) return false;

  try {
    storage.setItem(key, value);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Safely remove an item from storage
 */
export function removeStorageItem(key: string, type: StorageType): boolean {
  const storage = getStorage(type);
  if (!storage) return false;

  try {
    storage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
}
