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
  // URL-based filters (always in URL) - category is now route-based
  search?: string | null;
  page?: number;
  /** When set, show only products in this promotion (from hero "Shop Now") */
  promotionId?: string | null;

  // Optional filters (only in URL when set)
  minPrice?: number | null;
  maxPrice?: number | null;
  sortBy?: "latest" | "price-low" | "price-high" | "name" | null;
  inStockOnly?: boolean | null;
  minRating?: number | null;
  brands?: string[] | null;
}

export interface CanonicalFilters {
  category: string | null;
  search: string | null;
  promotionId: string | null;
  page: number;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: "latest" | "price-low" | "price-high" | "name";
  inStockOnly: boolean;
  minRating: number | null;
  brands: string[] | null;
}

const DEFAULT_FILTERS: CanonicalFilters = {
  category: null,
  search: null,
  promotionId: null,
  page: 1,
  minPrice: null,
  maxPrice: null,
  sortBy: "latest",
  inStockOnly: false,
  minRating: null,
  brands: null,
};

/**
 * Parse filters from URL search params with canonicalization and validation
 *
 * Rules:
 * - Trim search strings, remove if empty
 * - Parse numbers safely (NaN guard)
 * - Parse booleans safely (accept "true"/"false", "1"/"0")
 * - Validate page >= 1
 * - Validate minPrice/maxPrice as numbers, swap if minPrice > maxPrice
 * - Validate sortBy within allowed values, fallback to default
 * - Omit defaults (don't pollute URL)
 */
export function parseFiltersFromSearchParams(
  searchParams: ReadonlyURLSearchParams
): CanonicalFilters {
  // Category is now handled by routes, not URL params
  const category = null;

  // Check for both 'q' (from search page) and 'search' parameters
  const searchRaw = (
    searchParams.get("q") || searchParams.get("search")
  )?.trim();
  const search = searchRaw && searchRaw.length > 0 ? searchRaw : null;

  const pageRaw = searchParams.get("page");
  const page = pageRaw ? parseInt(pageRaw, 10) : 1;
  const pageNum = Math.max(1, isNaN(page) ? 1 : page);

  const promotionIdRaw = searchParams.get("promotionId");
  const promotionId =
    promotionIdRaw && promotionIdRaw.trim().length > 0
      ? promotionIdRaw.trim()
      : null;

  const minPriceRaw = searchParams.get("minPrice");
  let minPrice = minPriceRaw
    ? (() => {
        const num = parseFloat(minPriceRaw);
        return isNaN(num) || num < 0 ? null : num;
      })()
    : null;

  const maxPriceRaw = searchParams.get("maxPrice");
  let maxPrice = maxPriceRaw
    ? (() => {
        const num = parseFloat(maxPriceRaw);
        return isNaN(num) || num < 0 ? null : num;
      })()
    : null;

  // If both prices are set and minPrice > maxPrice, swap them
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

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

  const minRatingRaw = searchParams.get("minRating");
  const minRating = minRatingRaw
    ? (() => {
        const num = parseFloat(minRatingRaw);
        return isNaN(num) || num < 0 || num > 5 ? null : num;
      })()
    : null;

  const brandsRaw = searchParams.get("brands");
  const brands = brandsRaw
    ? brandsRaw
        .split(",")
        .filter((brand) => brand.trim().length > 0)
        .map((brand) => brand.trim())
    : null;

  return {
    category,
    search,
    promotionId,
    page: pageNum,
    minPrice,
    maxPrice,
    sortBy,
    inStockOnly,
    minRating,
    brands,
  };
}

/**
 * Normalize filters to canonical form before React Query calls.
 * This ensures:
 * - Numbers are properly converted (page, limit, minPrice, maxPrice)
 * - Booleans are properly converted (inStockOnly)
 * - Empty strings become undefined
 * - Defaults are handled consistently
 * - Query keys use only canonical values to avoid cache fragmentation
 */
export function normalizeFilters(params: {
  page?: number | string | null;
  limit?: number | string | null;
  categoryId?: string | null;
  search?: string | null;
  minPrice?: number | string | null;
  maxPrice?: number | string | null;
  sortBy?: "price" | "name" | "createdAt" | string | null;
  sortOrder?: "asc" | "desc" | string | null;
  inStockOnly?: boolean | string | null;
  promotionId?: string | null;
}): {
  page: number;
  limit: number;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy: "price" | "name" | "createdAt";
  sortOrder: "asc" | "desc";
  inStockOnly?: boolean;
  promotionId?: string;
} {
  // Normalize page
  const page =
    params.page === undefined || params.page === null || params.page === ""
      ? 1
      : typeof params.page === "string"
      ? (() => {
          const num = parseInt(params.page, 10);
          return isNaN(num) || num < 1 ? 1 : num;
        })()
      : params.page < 1
      ? 1
      : params.page;

  // Normalize limit
  const limit =
    params.limit === undefined || params.limit === null || params.limit === ""
      ? 20
      : typeof params.limit === "string"
      ? (() => {
          const num = parseInt(params.limit, 10);
          return isNaN(num) || num < 1 ? 20 : num;
        })()
      : params.limit < 1
      ? 20
      : params.limit;

  // Normalize categoryId: "" -> undefined
  const categoryId =
    params.categoryId === undefined ||
    params.categoryId === null ||
    params.categoryId === ""
      ? undefined
      : params.categoryId;

  // Normalize search: "" -> undefined, trim whitespace
  const search =
    params.search === undefined ||
    params.search === null ||
    params.search === ""
      ? undefined
      : typeof params.search === "string"
      ? params.search.trim() || undefined
      : params.search;

  // Normalize minPrice: "" -> undefined, convert to number
  const minPrice =
    params.minPrice === undefined ||
    params.minPrice === null ||
    params.minPrice === ""
      ? undefined
      : typeof params.minPrice === "string"
      ? (() => {
          const num = parseFloat(params.minPrice);
          return isNaN(num) || num < 0 ? undefined : num;
        })()
      : params.minPrice < 0
      ? undefined
      : params.minPrice;

  // Normalize maxPrice: "" -> undefined, convert to number
  const maxPrice =
    params.maxPrice === undefined ||
    params.maxPrice === null ||
    params.maxPrice === ""
      ? undefined
      : typeof params.maxPrice === "string"
      ? (() => {
          const num = parseFloat(params.maxPrice);
          return isNaN(num) || num < 0 ? undefined : num;
        })()
      : params.maxPrice < 0
      ? undefined
      : params.maxPrice;

  // Normalize sortBy: "" -> default, validate enum
  const sortByMap: Record<string, "price" | "name" | "createdAt"> = {
    price: "price",
    name: "name",
    createdAt: "createdAt",
  };
  const sortBy =
    params.sortBy === undefined ||
    params.sortBy === null ||
    params.sortBy === ""
      ? ("createdAt" as const)
      : typeof params.sortBy === "string" && sortByMap[params.sortBy]
      ? sortByMap[params.sortBy]
      : ("createdAt" as const);

  // Normalize sortOrder: "" -> default, validate enum
  const sortOrder =
    params.sortOrder === undefined ||
    params.sortOrder === null ||
    params.sortOrder === "" ||
    (typeof params.sortOrder === "string" &&
      params.sortOrder !== "asc" &&
      params.sortOrder !== "desc")
      ? ("desc" as const)
      : typeof params.sortOrder === "string"
      ? (params.sortOrder as "asc" | "desc")
      : params.sortOrder;

  // Normalize inStockOnly: "" -> undefined, convert to boolean
  const inStockOnly =
    params.inStockOnly === undefined ||
    params.inStockOnly === null ||
    params.inStockOnly === ""
      ? undefined
      : typeof params.inStockOnly === "string"
      ? (() => {
          const lower = params.inStockOnly.toLowerCase().trim();
          if (lower === "true" || lower === "1") return true;
          if (lower === "false" || lower === "0") return false;
          return undefined;
        })()
      : typeof params.inStockOnly === "boolean"
      ? params.inStockOnly
      : undefined;

  const promotionId =
    params.promotionId === undefined ||
    params.promotionId === null ||
    params.promotionId === ""
      ? undefined
      : typeof params.promotionId === "string"
      ? params.promotionId.trim() || undefined
      : undefined;

  const result: {
    page: number;
    limit: number;
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy: "price" | "name" | "createdAt";
    sortOrder: "asc" | "desc";
    inStockOnly?: boolean;
    promotionId?: string;
  } = {
    page,
    limit,
    sortBy,
    sortOrder,
  };

  if (categoryId !== undefined) {
    result.categoryId = categoryId;
  }
  if (search !== undefined) {
    result.search = search;
  }
  if (minPrice !== undefined) {
    result.minPrice = minPrice;
  }
  if (maxPrice !== undefined) {
    result.maxPrice = maxPrice;
  }
  if (inStockOnly !== undefined) {
    result.inStockOnly = inStockOnly;
  }
  if (promotionId !== undefined) {
    result.promotionId = promotionId;
  }

  return result;
}

/** Options for filtersToApiParams */
export interface FiltersToApiParamsOptions {
  /** Items per page (default: 20) */
  limit?: number;
}

/**
 * Convert canonical filters to backend API params
 */
export function filtersToApiParams(
  filters: CanonicalFilters,
  categoryIdMap: Map<string, string>,
  options?: FiltersToApiParamsOptions
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
  promotionId?: string;
} {
  const limit = options?.limit ?? 20;

  const normalized = normalizeFilters({
    page: filters.page,
    limit,
    categoryId: filters.category
      ? categoryIdMap.get(filters.category)
      : undefined,
    search: filters.search,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    promotionId: filters.promotionId,
    sortBy: (() => {
      switch (filters.sortBy) {
        case "price-low":
          return "price";
        case "price-high":
          return "price";
        case "name":
          return "name";
        case "latest":
        default:
          return "createdAt";
      }
    })(),
    sortOrder: (() => {
      switch (filters.sortBy) {
        case "price-low":
          return "asc";
        case "price-high":
          return "desc";
        case "name":
          return "asc";
        case "latest":
        default:
          return "desc";
      }
    })(),
    inStockOnly: filters.inStockOnly || undefined,
  });

  return normalized;
}

/**
 * Update URL search params with filter changes
 *
 * This helper creates a new URLSearchParams object with updated values.
 * It deletes params when value is null/undefined/"" or boolean false.
 * Always returns a new URLSearchParams instance.
 */
export function updateSearchParams(
  currentParams: ReadonlyURLSearchParams,
  updates: Partial<ProductFilters>
): URLSearchParams {
  const params = new URLSearchParams(currentParams.toString());

  // Update search - delete when null/undefined/""
  if (updates.search !== undefined) {
    const trimmed = updates.search?.trim();
    if (trimmed && trimmed.length > 0) {
      params.set("search", trimmed);
    } else {
      params.delete("search");
    }
  }

  // Update page - delete when <= 1 or null/undefined
  if (updates.page !== undefined) {
    if (updates.page !== null && updates.page > 1) {
      params.set("page", updates.page.toString());
    } else {
      params.delete("page");
    }
  }

  // Update minPrice - delete when null/undefined or <= 0
  if (updates.minPrice !== undefined) {
    if (updates.minPrice !== null && updates.minPrice > 0) {
      params.set("minPrice", updates.minPrice.toString());
    } else {
      params.delete("minPrice");
    }
  }

  // Update maxPrice - delete when null/undefined or >= Number.MAX_SAFE_INTEGER
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

  // Update sort - delete when null/undefined or default value
  if (updates.sortBy !== undefined) {
    if (updates.sortBy && updates.sortBy !== DEFAULT_FILTERS.sortBy) {
      params.set("sort", updates.sortBy);
    } else {
      params.delete("sort");
    }
  }

  // Update inStockOnly - delete when null/undefined or false
  if (updates.inStockOnly !== undefined) {
    if (updates.inStockOnly === true) {
      params.set("inStock", "true");
    } else {
      params.delete("inStock");
    }
  }

  // Update minRating - delete when null/undefined
  if (updates.minRating !== undefined) {
    if (
      updates.minRating !== null &&
      updates.minRating >= 0 &&
      updates.minRating <= 5
    ) {
      params.set("minRating", updates.minRating.toString());
    } else {
      params.delete("minRating");
    }
  }

  // Update brands - delete when null/undefined or empty array
  if (updates.brands !== undefined) {
    if (updates.brands && updates.brands.length > 0) {
      params.set("brands", updates.brands.join(","));
    } else {
      params.delete("brands");
    }
  }

  // Update promotionId - delete when null/undefined/""
  if (updates.promotionId !== undefined) {
    const v = updates.promotionId?.trim();
    if (v && v.length > 0) {
      params.set("promotionId", v);
    } else {
      params.delete("promotionId");
    }
  }

  return params;
}
