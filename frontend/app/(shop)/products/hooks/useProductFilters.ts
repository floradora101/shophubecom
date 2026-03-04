/**
 * useProductFilters Hook
 *
 * Handles parsing filters from URL and route params.
 * Provides derived values for navigation and category information.
 *
 * Responsibilities:
 * - Parse filters from URL search params
 * - Handle category from route params (for category pages)
 * - Derive base path for navigation
 * - Provide current category information
 */

import { useMemo } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { productRoutes, isProductCategoryPath } from "@/lib/routes";
import {
  parseFiltersFromSearchParams,
  type CanonicalFilters,
} from "@/features/products/utils/filters";
import type { Category } from "@/features/products/types";

interface UseProductFiltersProps {
  categorySlug?: string | null;
  categories?: Category[];
}

interface UseProductFiltersReturn {
  filters: CanonicalFilters;
  basePath: string;
  isCategoryPage: boolean;
  isSearchResultsPage: boolean;
  isDealsPage: boolean;
  currentCategory: Category | undefined;
  currentCategoryTitle: {
    italic: string;
    bold: string;
  };
}

/**
 * Hook for managing product filters from URL and route params
 */
export function useProductFilters({
  categorySlug,
  categories = [],
}: UseProductFiltersProps): UseProductFiltersReturn {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Derived values (non-hook computations)
  const isCategoryPage = isProductCategoryPath(pathname ?? "") ?? false;
  const isSearchResultsPage = pathname?.startsWith("/search/results") ?? false;

  // Parse filters from URL (single source of truth)
  // For category pages, category comes from route param, not query param
  const filters = useMemo(() => {
    const baseFilters = parseFiltersFromSearchParams(searchParams);
    // Override category from route if we're on a category page
    if (isCategoryPage && categorySlug) {
      return { ...baseFilters, category: categorySlug };
    }
    // For regular products page, use category from query params (if any)
    return baseFilters;
  }, [searchParams, categorySlug, isCategoryPage]);

  // Build the base path for navigation (either /products or /products/category/[slug])
  const basePath = useMemo(() => {
    if (isCategoryPage && categorySlug) {
      return productRoutes.category(categorySlug);
    }
    return productRoutes.list();
  }, [isCategoryPage, categorySlug]);

  // Get current category name for breadcrumb and title
  const currentCategory = useMemo(() => {
    return categories.find((c) => c.slug === filters.category);
  }, [categories, filters.category]);

  // Deals/promotion mode: when promotionId is in URL
  const isDealsPage = Boolean(filters.promotionId?.trim());

  // Get current category title for carousel (or "Deals" when promotion filter is active)
  const currentCategoryTitle = useMemo(() => {
    if (isDealsPage) {
      return { italic: "Deals", bold: "Promotion" };
    }
    if (isCategoryPage && currentCategory) {
      return {
        italic: "Category",
        bold: currentCategory.name,
      };
    }
    return {
      italic: "Advanced",
      bold: "Hardware",
    };
  }, [isCategoryPage, currentCategory, isDealsPage]);

  return {
    filters,
    basePath,
    isCategoryPage,
    isSearchResultsPage,
    isDealsPage,
    currentCategory,
    currentCategoryTitle,
  };
}
