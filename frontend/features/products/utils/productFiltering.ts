import { Product } from "../types";

export interface CategoryTreeHelpers {
  categoryIdMap: Map<string, string>;
  getDescendantIds: (rootId: string) => Set<string>;
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

/**
 * Pure function to filter and sort products based on canonical filters
 * This replaces the inline filtering logic in ProductsContent
 */
export function filterSortProducts(
  products: Product[],
  filters: CanonicalFilters,
  categoryTreeHelpers: CategoryTreeHelpers
): Product[] {
  let filteredProducts = [...products];

  // Apply category filter (supports parent category -> include children)
  if (filters.category) {
    const selectedId = categoryTreeHelpers.categoryIdMap.get(filters.category);
    if (selectedId) {
      const allowedIds = categoryTreeHelpers.getDescendantIds(selectedId);
      filteredProducts = filteredProducts.filter(
        (p) => p.categoryId && allowedIds.has(p.categoryId)
      );
    }
  }

  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description?.toLowerCase().includes(searchTerm)
    );
  }

  // Apply price range filter
  if (filters.minPrice !== null) {
    filteredProducts = filteredProducts.filter(
      (p) => p.price >= filters.minPrice!
    );
  }
  if (filters.maxPrice !== null) {
    filteredProducts = filteredProducts.filter(
      (p) => p.price <= filters.maxPrice!
    );
  }

  // Apply in stock filter
  if (filters.inStockOnly) {
    filteredProducts = filteredProducts.filter((p) => (p.stock ?? 0) > 0);
  }

  // Apply sorting
  switch (filters.sortBy) {
    case "price-low":
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case "name":
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "latest":
    default:
      // Keep original order (assuming it's already sorted by latest)
      break;
  }

  return filteredProducts;
}

/**
 * Pure function to paginate filtered products
 * Returns paginated data and metadata
 */
export function paginateProducts(
  filteredProducts: Product[],
  page: number,
  perPage: number
): {
  items: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
} {
  const total = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.max(1, Math.min(page, totalPages)); // Clamp page

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const items = filteredProducts.slice(startIndex, endIndex);

  return {
    items,
    total,
    totalPages,
    currentPage,
  };
}
