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
  minRating: number | null;
  brands: string[] | null;
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

  // Apply advanced search filter with scoring
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase().trim();
    const searchTokens = searchTerm
      .split(/\s+/)
      .filter((token) => token.length > 0);

    // Score each product based on search relevance
    const scoredProducts = filteredProducts.map((product) => {
      const name = product.name.toLowerCase();
      const description = product.description?.toLowerCase() || "";
      const category = product.category?.toLowerCase() || "";
      const tags = product.tags?.join(" ").toLowerCase() || "";

      let score = 0;
      let matchCount = 0;

      for (const token of searchTokens) {
        // Exact name match (highest priority)
        if (name.includes(token)) {
          score += 100;
          matchCount++;
          // Bonus for token at start of name
          if (name.startsWith(token)) score += 50;
        }

        // Description matches
        if (description.includes(token)) {
          score += 20;
          matchCount++;
        }

        // Category matches
        if (category.includes(token)) {
          score += 30;
          matchCount++;
        }

        // Tag matches
        if (tags.includes(token)) {
          score += 25;
          matchCount++;
        }
      }

      // Bonus for matching all tokens
      if (matchCount === searchTokens.length) {
        score += 50;
      }

      // Bonus for exact phrase match
      if (name.includes(searchTerm) || description.includes(searchTerm)) {
        score += 75;
      }

      return { product, score };
    });

    // Filter out products with no matches and sort by relevance
    filteredProducts = scoredProducts
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product);
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

  // Apply minimum rating filter
  if (filters.minRating !== null) {
    filteredProducts = filteredProducts.filter(
      (p) => (p.rating ?? 0) >= filters.minRating!
    );
  }

  // Apply brands filter
  if (filters.brands && filters.brands.length > 0) {
    const brandSet = new Set(
      filters.brands.map((brand) => brand.toLowerCase())
    );
    filteredProducts = filteredProducts.filter(
      (p) => p.brand && brandSet.has(p.brand.toLowerCase())
    );
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
