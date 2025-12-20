/**
 * Form draft persistence hook for react-hook-form
 * Persists form data to storage (sessionStorage or localStorage) with debounce
 */

import { useEffect, useCallback, useRef } from "react";
import type { UseFormReturn, FieldValues } from "react-hook-form";
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  type StorageType,
} from "./draftStorage";

export interface UseFormDraftOptions {
  /** Storage key (required) - e.g., "draft:add-product" or "draft:checkout:${cartId}" */
  key: string;
  /** Storage type - "session" (default) or "local" */
  storage?: StorageType;
  /** Debounce delay in milliseconds (default: 400) */
  debounceMs?: number;
  /** Fields to exclude from persistence (e.g., passwords, payment info) */
  exclude?: string[];
  /** Enable/disable draft persistence (default: true) - useful for waiting until data is ready */
  enabled?: boolean;
}

/**
 * Hook to persist form drafts to storage
 *
 * Usage:
 * ```tsx
 * const form = useForm<FormData>({ ... });
 * const { clearDraft } = useFormDraft(form, {
 *   key: "draft:checkout",
 *   storage: "session",
 *   exclude: ["password", "creditCard"],
 *   enabled: !!cartId,
 * });
 *
 * // On successful submit:
 * clearDraft();
 * ```
 */
export function useFormDraft<T extends FieldValues>(
  form: UseFormReturn<T>,
  options: UseFormDraftOptions
) {
  const {
    key,
    storage = "session",
    debounceMs = 400,
    exclude = [],
    enabled = true,
  } = options;

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedRef = useRef(false);

  /**
   * Exclude sensitive fields from draft data
   */
  const sanitizeFormData = useCallback(
    (data: T): Partial<T> => {
      if (exclude.length === 0) return data;

      const sanitized = { ...data };
      for (const field of exclude) {
        // Handle nested fields like "payment.cardNumber"
        const parts = field.split(".");
        let current: any = sanitized;
        for (let i = 0; i < parts.length - 1; i++) {
          if (current && typeof current === "object") {
            current = current[parts[i]];
          }
        }
        if (current && typeof current === "object") {
          const lastPart = parts[parts.length - 1];
          if (lastPart in current) {
            delete current[lastPart];
          }
        } else {
          // Simple field
          delete sanitized[field as keyof T];
        }
      }
      return sanitized;
    },
    [exclude]
  );

  /**
   * Save draft to storage
   */
  const saveDraft = useCallback(
    (data: T) => {
      if (!enabled) return;

      try {
        const sanitized = sanitizeFormData(data);
        const serialized = JSON.stringify(sanitized);
        setStorageItem(key, serialized, storage);
      } catch (error) {
        // Silently fail if storage is unavailable
      }
    },
    [enabled, key, storage, sanitizeFormData]
  );

  /**
   * Load draft from storage and apply to form
   */
  const loadDraft = useCallback(() => {
    if (!enabled || hasLoadedRef.current) return;

    try {
      const stored = getStorageItem(key, storage);
      if (!stored) return;

      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        // Reset form with saved values, keeping default values for fields not in draft
        form.reset(parsed as any, { keepDefaultValues: true });
        hasLoadedRef.current = true;
      }
    } catch (error) {
      // Corrupt draft - delete it
      removeStorageItem(key, storage);
    }
  }, [enabled, key, storage, form]);

  /**
   * Clear draft from storage
   */
  const clearDraft = useCallback(() => {
    removeStorageItem(key, storage);
    hasLoadedRef.current = false;
  }, [key, storage]);

  /**
   * Save draft immediately (no debounce)
   */
  const saveDraftNow = useCallback(() => {
    const currentValues = form.getValues();
    saveDraft(currentValues);
  }, [form, saveDraft]);

  // Load draft on mount (when enabled)
  useEffect(() => {
    if (enabled) {
      loadDraft();
    }
  }, [enabled, loadDraft]);

  // Watch form changes and save with debounce
  useEffect(() => {
    if (!enabled) return;

    const subscription = form.watch((data) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        saveDraft(data as T);
      }, debounceMs);
    });

    return () => {
      subscription.unsubscribe();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [enabled, form, saveDraft, debounceMs]);

  return {
    clearDraft,
    saveDraftNow,
  };
}
