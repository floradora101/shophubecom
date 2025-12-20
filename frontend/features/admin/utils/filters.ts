/**
 * URL-based Filter Utilities for Admin
 *
 * This module provides utilities for parsing and updating URL search parameters
 * as the single source of truth for admin filters.
 */

import { ReadonlyURLSearchParams } from "next/navigation";
import {
  normalizeAdminProductsFilters,
  type NormalizedAdminProductsFilters,
} from "./normalize-filters";

export interface AdminProductFilters {
  search?: string | null;
  categoryId?: string | null;
  page?: number;
  sortBy?: "name" | "price" | "createdAt" | null;
  sortOrder?: "asc" | "desc" | null;
}

const DEFAULT_FILTERS = {
  page: 1,
  limit: 10,
  sortBy: "createdAt" as const,
  sortOrder: "desc" as const,
};

/**
 * Parse filters from URL search params
 */
export function parseAdminFiltersFromSearchParams(
  searchParams: ReadonlyURLSearchParams
): AdminProductFilters {
  const searchRaw = searchParams.get("search")?.trim();
  const search = searchRaw && searchRaw.length > 0 ? searchRaw : null;

  const categoryIdRaw = searchParams.get("categoryId");
  const categoryId =
    categoryIdRaw && categoryIdRaw.length > 0 ? categoryIdRaw : null;

  const pageRaw = searchParams.get("page");
  const page = pageRaw ? parseInt(pageRaw, 10) : 1;
  const pageNum = isNaN(page) || page < 1 ? 1 : page;

  const sortByRaw = searchParams.get("sortBy");
  const sortByMap: Record<string, "name" | "price" | "createdAt"> = {
    name: "name",
    price: "price",
    createdAt: "createdAt",
  };
  const sortBy = (sortByRaw && sortByMap[sortByRaw]) || DEFAULT_FILTERS.sortBy;

  const sortOrderRaw = searchParams.get("sortOrder");
  const sortOrder = (
    sortOrderRaw === "asc" || sortOrderRaw === "desc"
      ? sortOrderRaw
      : DEFAULT_FILTERS.sortOrder
  ) as "asc" | "desc";

  return {
    search,
    categoryId,
    page: pageNum,
    sortBy,
    sortOrder,
  };
}

/**
 * Convert admin filters to normalized API params
 */
export function adminFiltersToApiParams(
  filters: AdminProductFilters
): NormalizedAdminProductsFilters {
  return normalizeAdminProductsFilters({
    search: filters.search,
    categoryId: filters.categoryId,
    page: filters.page,
    limit: 10,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });
}

/**
 * Update URL search params with filter changes
 */
export function updateAdminSearchParams(
  currentParams: ReadonlyURLSearchParams,
  updates: Partial<AdminProductFilters>
): URLSearchParams {
  const params = new URLSearchParams(currentParams.toString());

  // Update search
  if (updates.search !== undefined) {
    const trimmed = updates.search?.trim();
    if (trimmed && trimmed.length > 0) {
      params.set("search", trimmed);
    } else {
      params.delete("search");
    }
  }

  // Update categoryId
  if (updates.categoryId !== undefined) {
    if (updates.categoryId && updates.categoryId.length > 0) {
      params.set("categoryId", updates.categoryId);
    } else {
      params.delete("categoryId");
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

  // Update sortBy
  if (updates.sortBy !== undefined) {
    if (updates.sortBy && updates.sortBy !== DEFAULT_FILTERS.sortBy) {
      params.set("sortBy", updates.sortBy);
    } else {
      params.delete("sortBy");
    }
  }

  // Update sortOrder
  if (updates.sortOrder !== undefined) {
    if (updates.sortOrder && updates.sortOrder !== DEFAULT_FILTERS.sortOrder) {
      params.set("sortOrder", updates.sortOrder);
    } else {
      params.delete("sortOrder");
    }
  }

  return params;
}
