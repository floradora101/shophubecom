/**
 * useFilterHelpers Hook
 *
 * Provides helper functions and computed values for filters.
 *
 * Responsibilities:
 * - Calculate available brands from all products
 * - Check if any filters are active
 * - Calculate price range for filter UI
 */

import { useMemo, useCallback } from "react";
import {
  mockProducts,
  mockProductToProduct,
} from "@/lib/mock-data/mock-data";
import type { CanonicalFilters } from "@/features/products/utils/filters";
import type { Product } from "@/features/products/types";

interface UseFilterHelpersProps {
  hasInteracted?: boolean;
  filters: CanonicalFilters;
  filteredProducts: Product[]; // For price range calculation
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
  // Get available brands from all products
  const availableBrands = useMemo(() => {
    if (!hasInteracted) return [];
    const brandSet = new Set<string>();
    mockProducts.forEach((product: any) => {
      const normalized = mockProductToProduct(product);
      if (normalized.brand) {
        brandSet.add(normalized.brand);
      }
    });
    return Array.from(brandSet).sort();
  }, [hasInteracted]);

  // Check if there are any active filters
  const hasActiveFilters = useCallback(() => {
    return !!(
      filters.search ||
      filters.category ||
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
