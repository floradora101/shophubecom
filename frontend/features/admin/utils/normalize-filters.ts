/**
 * Normalize admin filters to canonical form before React Query calls.
 * This ensures:
 * - Numbers are properly converted (page, limit)
 * - Booleans are properly converted
 * - Empty strings become undefined
 * - Defaults are handled consistently
 * - Query keys use only canonical values to avoid cache fragmentation
 */

export interface AdminProductsFilters {
  search?: string | null;
  categoryId?: string | null;
  page?: number | string | null;
  limit?: number | string | null;
  sortBy?: "name" | "price" | "createdAt" | string | null;
  sortOrder?: "asc" | "desc" | string | null;
}

export interface NormalizedAdminProductsFilters {
  search?: string;
  categoryId?: string;
  page: number;
  limit: number;
  sortBy: "name" | "price" | "createdAt";
  sortOrder: "asc" | "desc";
}

/**
 * Normalize admin products filters
 */
export function normalizeAdminProductsFilters(
  params?: AdminProductsFilters | null
): NormalizedAdminProductsFilters {
  if (!params) {
    return {
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
  }

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
      ? 10
      : typeof params.limit === "string"
      ? (() => {
          const num = parseInt(params.limit, 10);
          return isNaN(num) || num < 1 ? 10 : num;
        })()
      : params.limit < 1
      ? 10
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

  // Normalize sortBy: "" -> default, validate enum
  const sortByMap: Record<string, "name" | "price" | "createdAt"> = {
    name: "name",
    price: "price",
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

  const result: NormalizedAdminProductsFilters = {
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

  return result;
}
