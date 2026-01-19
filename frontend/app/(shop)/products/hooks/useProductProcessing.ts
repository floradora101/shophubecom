/**
 * useProductProcessing Hook
 *
 * Handles product loading, filtering, sorting, and pagination.
 *
 * Responsibilities:
 * - Load and normalize mock products
 * - Filter products based on filters
 * - Sort products
 * - Paginate products
 */

import { useMemo, useState, useEffect } from "react";
import {
  mockProducts,
  mockProductToProduct,
} from "@/lib/mock-data/mock-data";
import {
  filterSortProducts,
  paginateProducts,
} from "@/features/products/utils/productFiltering";
import type { CanonicalFilters } from "@/features/products/utils/filters";
import type { Product } from "@/features/products/types";
import type { CategoryTreeHelpers } from "@/features/products/utils/productFiltering";

interface UseProductProcessingProps {
  hasInteracted?: boolean;
  filters: CanonicalFilters;
  categoryTreeHelpers: CategoryTreeHelpers;
  itemsPerPage: number;
}

interface UseProductProcessingReturn {
  products: Product[];
  totalResults: number;
  totalPages: number;
  filteredProducts: Product[]; // For price range calculation
  isLoading: boolean;
  productsError: boolean;
}

/**
 * Hook for processing products (filtering, sorting, pagination)
 */
export function useProductProcessing({
  hasInteracted = true,
  filters,
  categoryTreeHelpers,
  itemsPerPage,
}: UseProductProcessingProps): UseProductProcessingReturn {
  // Normalize mock products once to avoid repeated conversions - only when user has interacted
  const allMockProducts = useMemo(() => {
    if (!hasInteracted) return [];
    return mockProducts.map(mockProductToProduct);
  }, [hasInteracted]);

  // Filter and sort products using pure function - only when user has interacted
  const filteredProducts = useMemo(() => {
    if (!hasInteracted) return [];
    return filterSortProducts(allMockProducts, filters, categoryTreeHelpers);
  }, [allMockProducts, filters, categoryTreeHelpers, hasInteracted]);

  // Simulate loading states for demonstration
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError] = useState(false);

  // Set loading to false immediately when filters change
  useEffect(() => {
    // Just a tiny delay to show the "updating" state if needed, or keep it false
    setProductsLoading(false);
  }, [filters]);

  const isLoading = productsLoading;

  // Paginate filtered products
  const paginationResult = useMemo(
    () => paginateProducts(filteredProducts, filters.page, itemsPerPage),
    [filteredProducts, filters.page, itemsPerPage]
  );

  const products = paginationResult.items;
  const totalResults = paginationResult.total;
  const totalPages = paginationResult.totalPages;

  return {
    products,
    totalResults,
    totalPages,
    filteredProducts,
    isLoading,
    productsError,
  };
}
