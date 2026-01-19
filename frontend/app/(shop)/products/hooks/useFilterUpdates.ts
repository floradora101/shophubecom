/**
 * useFilterUpdates Hook
 *
 * Provides filter update functions that sync with URL.
 * Handles navigation and URL updates when filters change.
 *
 * Responsibilities:
 * - Generate filter update functions (setCategory, setPriceRange, etc.)
 * - Handle URL navigation on filter changes
 * - Reset page to 1 when filters change (except pagination)
 * - Preserve existing query params when appropriate
 */

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  updateSearchParams,
  type CanonicalFilters,
} from "@/features/products/utils/filters";

interface UseFilterUpdatesProps {
  basePath: string;
  searchParams: ReturnType<typeof useSearchParams>;
  router: ReturnType<typeof useRouter>;
}

interface UseFilterUpdatesReturn {
  setCategory: (categorySlug: string | null) => void;
  setPriceRange: (range: { min: number; max: number }) => void;
  setSortBy: (sortBy: CanonicalFilters["sortBy"]) => void;
  setInStockOnly: (inStockOnly: boolean) => void;
  setMinRating: (minRating: number | null) => void;
  setBrands: (brands: string[] | null) => void;
  setPage: (page: number) => void;
}

/**
 * Hook for managing filter updates and URL synchronization
 */
export function useFilterUpdates({
  basePath,
  searchParams,
  router,
}: UseFilterUpdatesProps): UseFilterUpdatesReturn {
  const updateFilters = useMemo(
    () => ({
      setCategory: (categorySlug: string | null) => {
        // Preserve existing query params when switching category
        if (categorySlug) {
          // Going to category page - keep query params except remove category from query
          const newParams = updateSearchParams(searchParams, {
            page: 1, // Reset to page 1 when changing category
          });
          router.push(
            `/products/category/${categorySlug}?${newParams.toString()}`
          );
        } else {
          // Going to main products page - keep query params
          const newParams = updateSearchParams(searchParams, {
            page: 1, // Reset to page 1 when changing category
          });
          router.push(`/products?${newParams.toString()}`);
        }
      },

      setPriceRange: (range: { min: number; max: number }) => {
        const newParams = updateSearchParams(searchParams, {
          minPrice: range.min > 0 ? range.min : null,
          maxPrice: range.max < Number.MAX_SAFE_INTEGER ? range.max : null,
          page: 1, // Reset to page 1 when price range changes
        });
        router.push(`${basePath}?${newParams.toString()}`);
      },

      setSortBy: (sortBy: CanonicalFilters["sortBy"]) => {
        const newParams = updateSearchParams(searchParams, {
          sortBy,
          page: 1, // Reset to page 1 when sort changes
        });
        router.push(`${basePath}?${newParams.toString()}`);
      },

      setInStockOnly: (inStockOnly: boolean) => {
        const newParams = updateSearchParams(searchParams, {
          inStockOnly,
          page: 1, // Reset to page 1 when stock filter changes
        });
        router.push(`${basePath}?${newParams.toString()}`);
      },

      setMinRating: (minRating: number | null) => {
        const newParams = updateSearchParams(searchParams, {
          minRating,
          page: 1, // Reset to page 1 when rating filter changes
        });
        router.push(`${basePath}?${newParams.toString()}`);
      },

      setBrands: (brands: string[] | null) => {
        const newParams = updateSearchParams(searchParams, {
          brands,
          page: 1, // Reset to page 1 when brands filter changes
        });
        router.push(`${basePath}?${newParams.toString()}`);
      },

      setPage: (page: number) => {
        const newParams = updateSearchParams(searchParams, {
          page,
        });
        router.push(`${basePath}?${newParams.toString()}`, { scroll: false });
      },
    }),
    [searchParams, router, basePath]
  );

  return updateFilters;
}
