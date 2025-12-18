/**
 * URL-based Filter Utilities
 *
 * This module provides utilities for parsing and updating URL search parameters
 * as the single source of truth for product filters.
 *
 * All filters are stored in the URL for:
 * - Shareability (users can share filtered views)
 * - Bookmarkability (filters persist across sessions)
 * - Browser back/forward navigation support
 * - No client-side state drift
 */

import { ReadonlyURLSearchParams } from "next/navigation";

export interface ProductFilters {
  // URL-based filters (always in URL)
  category?: string | null;
  search?: string | null;
  page?: number;

  // Optional filters (only in URL when set)
  minPrice?: number | null;
  maxPrice?: number | null;
  sortBy?: "latest" | "price-low" | "price-high" | "name" | null;
  inStockOnly?: boolean | null;
}

export interface CanonicalFilters {
  category: string | null;
  search: string | null;
  page: number;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: "latest" | "price-low" | "price-high" | "name";
  inStockOnly: boolean;
}

const DEFAULT_FILTERS: CanonicalFilters = {
  category: null,
  search: null,
  page: 1,
  minPrice: null,
  maxPrice: null,
  sortBy: "latest",
  inStockOnly: false,
};

/**
 * Parse filters from URL search params with canonicalization
 *
 * Rules:
 * - Trim search strings, remove if empty
 * - Parse numbers safely (NaN guard)
 * - Parse booleans safely (accept "true"/"false", "1"/"0")
 * - Omit defaults (don't pollute URL)
 * - Page defaults to 1
 */
export function parseFiltersFromSearchParams(
  searchParams: ReadonlyURLSearchParams
): CanonicalFilters {
  const category = searchParams.get("category")?.trim() || null;

  const searchRaw = searchParams.get("search")?.trim();
  const search = searchRaw && searchRaw.length > 0 ? searchRaw : null;

  const pageRaw = searchParams.get("page");
  const page = pageRaw ? parseInt(pageRaw, 10) : 1;
  const pageNum = isNaN(page) || page < 1 ? 1 : page;

  const minPriceRaw = searchParams.get("minPrice");
  const minPrice = minPriceRaw
    ? (() => {
        const num = parseFloat(minPriceRaw);
        return isNaN(num) || num < 0 ? null : num;
      })()
    : null;

  const maxPriceRaw = searchParams.get("maxPrice");
  const maxPrice = maxPriceRaw
    ? (() => {
        const num = parseFloat(maxPriceRaw);
        return isNaN(num) || num < 0 ? null : num;
      })()
    : null;

  const sortByRaw = searchParams.get("sort");
  const sortByMap: Record<string, CanonicalFilters["sortBy"]> = {
    latest: "latest",
    "price-low": "price-low",
    "price-high": "price-high",
    name: "name",
  };
  const sortBy = (sortByRaw && sortByMap[sortByRaw]) || DEFAULT_FILTERS.sortBy;

  const inStockRaw = searchParams.get("inStock");
  const inStockOnly =
    inStockRaw === "true" || inStockRaw === "1"
      ? true
      : inStockRaw === "false" || inStockRaw === "0"
      ? false
      : DEFAULT_FILTERS.inStockOnly;

  return {
    category,
    search,
    page: pageNum,
    minPrice,
    maxPrice,
    sortBy,
    inStockOnly,
  };
}

/**
 * Convert canonical filters to backend API params
 */
export function filtersToApiParams(
  filters: CanonicalFilters,
  categoryIdMap: Map<string, string> // Map category slug -> category ID
): {
  page: number;
  limit: number;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy: "price" | "name" | "createdAt";
  sortOrder: "asc" | "desc";
  inStockOnly?: boolean;
} {
  const params: {
    page: number;
    limit: number;
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy: "price" | "name" | "createdAt";
    sortOrder: "asc" | "desc";
    inStockOnly?: boolean;
  } = {
    page: filters.page,
    limit: 20,
    sortBy: "createdAt" as const,
    sortOrder: "desc" as const,
  };

  if (filters.category) {
    const categoryId = categoryIdMap.get(filters.category);
    if (categoryId) {
      params.categoryId = categoryId;
    }
  }

  if (filters.search) {
    params.search = filters.search;
  }

  if (
    filters.minPrice !== null &&
    filters.minPrice !== undefined &&
    filters.minPrice > 0
  ) {
    params.minPrice = filters.minPrice;
  }

  if (
    filters.maxPrice !== null &&
    filters.maxPrice !== undefined &&
    filters.maxPrice < Number.MAX_SAFE_INTEGER
  ) {
    params.maxPrice = filters.maxPrice;
  }

  // Convert frontend sort to backend sort
  switch (filters.sortBy) {
    case "price-low":
      params.sortBy = "price";
      params.sortOrder = "asc";
      break;
    case "price-high":
      params.sortBy = "price";
      params.sortOrder = "desc";
      break;
    case "name":
      params.sortBy = "name";
      params.sortOrder = "asc";
      break;
    case "latest":
    default:
      params.sortBy = "createdAt";
      params.sortOrder = "desc";
      break;
  }

  if (filters.inStockOnly) {
    params.inStockOnly = true;
  }

  return params;
}

/**
 * Update URL search params with filter changes
 *
 * This helper creates a new URLSearchParams object with updated values.
 * It omits default values to keep URLs clean.
 */
export function updateSearchParams(
  currentParams: ReadonlyURLSearchParams,
  updates: Partial<ProductFilters>
): URLSearchParams {
  const params = new URLSearchParams(currentParams.toString());

  // Update category
  if (updates.category !== undefined) {
    if (updates.category) {
      params.set("category", updates.category);
    } else {
      params.delete("category");
    }
  }

  // Update search
  if (updates.search !== undefined) {
    const trimmed = updates.search?.trim();
    if (trimmed && trimmed.length > 0) {
      params.set("search", trimmed);
    } else {
      params.delete("search");
    }
  }

  // Update page
  if (updates.page !== undefined) {
    if (updates.page > 1) {
      params.set("page", updates.page.toString());
    } else {
      params.delete("page");
    }
  }

  // Update minPrice
  if (updates.minPrice !== undefined) {
    if (updates.minPrice !== null && updates.minPrice > 0) {
      params.set("minPrice", updates.minPrice.toString());
    } else {
      params.delete("minPrice");
    }
  }

  // Update maxPrice
  if (updates.maxPrice !== undefined) {
    if (
      updates.maxPrice !== null &&
      updates.maxPrice < Number.MAX_SAFE_INTEGER
    ) {
      params.set("maxPrice", updates.maxPrice.toString());
    } else {
      params.delete("maxPrice");
    }
  }

  // Update sort
  if (updates.sortBy !== undefined) {
    if (updates.sortBy && updates.sortBy !== DEFAULT_FILTERS.sortBy) {
      params.set("sort", updates.sortBy);
    } else {
      params.delete("sort");
    }
  }

  // Update inStockOnly
  if (updates.inStockOnly !== undefined) {
    if (updates.inStockOnly) {
      params.set("inStock", "true");
    } else {
      params.delete("inStock");
    }
  }

  return params;
}
