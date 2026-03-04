/**
 * useVariantSelection Hook
 *
 * Manages variant selection state and URL synchronization.
 *
 * Responsibilities:
 * - Parse variant selections from URL params
 * - Manage selected options state
 * - Sync URL when selections change
 * - Sync state when URL changes
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { productRoutes } from "@/lib/routes";

interface UseVariantSelectionProps {
  slug: string;
}

interface UseVariantSelectionReturn {
  selectedOptions: Record<string, string>;
  selectedOptionsState: Record<string, string>;
  setSelectedOptionsState: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  updateUrlWithSelections: (newSelections: Record<string, string>) => void;
}

/**
 * Hook for managing variant selection state and URL sync
 */
export function useVariantSelection({
  slug,
}: UseVariantSelectionProps): UseVariantSelectionReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse URL variant selections
  const selectedOptions = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    const options: Record<string, string> = {};
    ["color", "size", "storage", "style"].forEach((key) => {
      const value = params.get(key);
      if (value) options[key] = value;
    });
    return options;
  }, [searchParams]);

  const [selectedOptionsState, setSelectedOptionsState] =
    useState(selectedOptions);

  // Update URL when selections change
  const updateUrlWithSelections = useCallback(
    (newSelections: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newSelections).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      const newUrl = params.toString() ? `?${params.toString()}` : "";
      router.replace(`${productRoutes.detail(slug)}${newUrl}`, { scroll: false });
    },
    [router, searchParams, slug]
  );

  // Sync URL params to state
  useEffect(() => {
    setSelectedOptionsState(selectedOptions);
  }, [selectedOptions]);

  return {
    selectedOptions,
    selectedOptionsState,
    setSelectedOptionsState,
    updateUrlWithSelections,
  };
}
