/**
 * useSearchInput Hook
 *
 * Manages search input state and URL synchronization.
 *
 * Responsibilities:
 * - Input value state
 * - URL query parameter sync
 * - Input focus management
 * - Close navigation handling
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface UseSearchInputReturn {
  inputValue: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClose: () => void;
}

/**
 * Hook for managing search input state and navigation
 */
export function useSearchInput(): UseSearchInputReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Input value for live search
  const initialQuery = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update URL when input changes (for bookmarking)
  useEffect(() => {
    const params = new URLSearchParams();
    if (inputValue.trim()) {
      params.set("q", inputValue);
    }
    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ""}`;
    router.replace(newUrl, { scroll: false });
  }, [inputValue, router]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    // Try to go back, fallback to home
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return {
    inputValue,
    inputRef,
    handleInputChange,
    handleClose,
  };
}
