/**
 * useClickOutside Hook
 *
 * Handles click outside detection for dropdowns and modals.
 */

import { useEffect, RefObject } from "react";

/**
 * Hook for detecting clicks outside a referenced element
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void,
  isOpen: boolean
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, handler, isOpen]);
}
