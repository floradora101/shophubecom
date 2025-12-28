/**
 * URL-based Category Filter Utilities
 *
 * Similar to products filtering but simplified for categories.
 * All filters are stored in the URL for shareability and bookmarkability.
 */

import { ReadonlyURLSearchParams } from "next/navigation";

export interface CategoryFilters {
  search?: string | null;
  sortBy?: "name-asc" | "name-desc" | null;
}

export interface CanonicalCategoryFilters {
  search: string | null;
  sortBy: "name-asc" | "name-desc";
}

const DEFAULT_FILTERS: CanonicalCategoryFilters = {
  search: null,
  sortBy: "name-desc",
};

/**
 * Parse category filters from URL search params
 */
export function parseCategoryFiltersFromSearchParams(
  searchParams: ReadonlyURLSearchParams
): CanonicalCategoryFilters {
  const searchRaw = searchParams.get("search")?.trim();
  const search = searchRaw && searchRaw.length > 0 ? searchRaw : null;

  const sortByRaw = searchParams.get("sort");
  const sortByMap: Record<string, CanonicalCategoryFilters["sortBy"]> = {
    "name-asc": "name-asc",
    "name-desc": "name-desc",
  };
  const sortBy = (sortByRaw && sortByMap[sortByRaw]) || DEFAULT_FILTERS.sortBy;

  return {
    search,
    sortBy,
  };
}

/**
 * Update URL search params with category filter changes
 */
export function updateCategorySearchParams(
  currentParams: ReadonlyURLSearchParams,
  updates: Partial<CategoryFilters>
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

  // Update sort - delete when null/undefined or default value
  if (updates.sortBy !== undefined) {
    if (updates.sortBy && updates.sortBy !== DEFAULT_FILTERS.sortBy) {
      params.set("sort", updates.sortBy);
    } else {
      params.delete("sort");
    }
  }

  return params;
}
