/**
 * useFilterHelpers Hook
 *
 * Provides helper functions and computed values for filters.
 *
 * Responsibilities:
 * - Derive available brands from products (API data when USE_MOCKS=false)
 * - Check if any filters are active
 * - Calculate price range for filter UI
 */

import { useMemo, useCallback } from "react";
import type { CanonicalFilters } from "@/features/products/utils/filters";
import type { Product } from "@/features/products/types";

interface UseFilterHelpersProps {
  hasInteracted?: boolean;
  filters: CanonicalFilters;
  filteredProducts: Product[]; // For price range and brands derivation
}

interface UseFilterHelpersReturn {
  availableBrands: string[];
  hasActiveFilters: () => boolean;
  priceRange: { min: number; max: number };
}

/**
 * Hook for filter helper functions and computed values
 */
export function useFilterHelpers({
  hasInteracted = true,
  filters,
  filteredProducts,
}: UseFilterHelpersProps): UseFilterHelpersReturn {
  // Derive available brands from filtered products (API data)
  const availableBrands = useMemo(() => {
    if (!hasInteracted) return [];
    const brandSet = new Set<string>();
    filteredProducts.forEach((product) => {
      if (product.brand) {
        brandSet.add(product.brand);
      }
    });
    return Array.from(brandSet).sort();
  }, [hasInteracted, filteredProducts]);

  // Check if there are any active filters
  const hasActiveFilters = useCallback(() => {
    return !!(
      filters.search ||
      filters.category ||
      filters.promotionId ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.inStockOnly ||
      filters.minRating ||
      (filters.brands && filters.brands.length > 0) ||
      filters.sortBy !== "latest"
    );
  }, [filters]);

  // Calculate price range for filters from ALL filtered products (not just current page)
  const maxProductPrice = useMemo(
    () =>
      filteredProducts.length
        ? Math.max(...filteredProducts.map((p) => p.price))
        : 0,
    [filteredProducts]
  );

  const priceRange = useMemo(
    () => ({
      min: filters.minPrice ?? 0,
      max: filters.maxPrice ?? Math.max(maxProductPrice, 5000),
    }),
    [filters.minPrice, filters.maxPrice, maxProductPrice]
  );

  return {
    availableBrands,
    hasActiveFilters,
    priceRange,
  };
}
