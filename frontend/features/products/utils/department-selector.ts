import type { Product } from "../types";
import { getEffectiveStock } from "./inventory";

export type LayoutStyle = "grid" | "carousel" | "featured" | "masonry";

/**
 * Number of items to display per layout style
 */
export const ITEMS_PER_LAYOUT: Record<LayoutStyle, number> = {
  grid: 8,
  carousel: 8,
  masonry: 6,
  featured: 3,
};

/**
 * Scoring weights for each department
 * Higher weight = higher priority in selection
 */
export const DEPARTMENT_WEIGHTS: Record<
  string,
  {
    featured: number;
    discount: number;
    rating: number;
    reviews: number;
    newest: number;
  }
> = {
  electronics: {
    featured: 100,
    discount: 50,
    rating: 30,
    reviews: 25,
    newest: 10,
  },
  clothing: {
    featured: 100,
    discount: 50,
    newest: 30,
    rating: 20,
    reviews: 0,
  },
  books: {
    featured: 100,
    newest: 50,
    rating: 30,
    reviews: 25,
    discount: 0,
  },
  "home-garden": {
    featured: 100,
    rating: 50,
    reviews: 40,
    discount: 30,
    newest: 10,
  },
};

/**
 * Configuration for product selection
 */
interface SelectorConfig {
  /**
   * Filter out products with zero stock
   * @default false
   */
  filterOutOfStock?: boolean;
}

/**
 * Calculate discount percentage from product fields
 */
function getDiscountPercent(product: Product): number {
  if (product.discount?.discountPercent) {
    return product.discount.discountPercent;
  }
  if (product.discountValue) {
    return product.discountValue;
  }
  if (product.discountPercent) {
    return product.discountPercent;
  }
  // Calculate from originalPrice if available
  if (product.originalPrice && product.originalPrice > product.price) {
    return (
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    );
  }
  return 0;
}

/**
 * Get rating from product (if available)
 */
function getRating(product: Product): number {
  // @ts-expect-error - rating may not be in type yet but could exist at runtime
  return product.rating ?? 0;
}

/**
 * Get review count from product (if available)
 */
function getReviewCount(product: Product): number {
  // @ts-expect-error - reviewCount may not be in type yet but could exist at runtime
  return product.reviewCount ?? 0;
}

/**
 * Calculate product score based on department weights
 */
function calculateScore(
  product: Product,
  weights: (typeof DEPARTMENT_WEIGHTS)[string]
): number {
  let score = 0;

  // Featured products get highest priority
  if (product.isFeatured) {
    score += weights.featured;
  }

  // Discount scoring
  const discountPercent = getDiscountPercent(product);
  if (discountPercent > 0) {
    // Scale discount: 10% = 0.1, 50% = 0.5, etc.
    score += weights.discount * (discountPercent / 100);
  }

  // Rating scoring (0-5 scale, normalize to 0-1)
  const rating = getRating(product);
  if (rating > 0) {
    score += weights.rating * (rating / 5);
  }

  // Review count scoring (normalize: assume max meaningful reviews = 1000)
  const reviewCount = getReviewCount(product);
  if (reviewCount > 0) {
    score += weights.reviews * Math.min(reviewCount / 1000, 1);
  }

  // Newest scoring (normalize by days since creation, newer = higher)
  if (product.createdAt) {
    const daysSinceCreation =
      (Date.now() - new Date(product.createdAt).getTime()) /
      (1000 * 60 * 60 * 24);
    // Products less than 30 days old get full weight, then decay
    const freshness = Math.max(0, 1 - daysSinceCreation / 30);
    score += weights.newest * freshness;
  }

  return score;
}

/**
 * Select products for a department based on scoring weights
 * Returns exactly `count` items, filling from fallback pool if needed
 *
 * @param products - Products from the department category
 * @param slug - Department slug (e.g., "electronics", "clothing")
 * @param count - Exact number of products to return
 * @param fallbackPool - Products to use if category doesn't have enough (excludes duplicates)
 * @param config - Optional configuration
 * @returns Array of exactly `count` products (or fewer if fallback pool is insufficient)
 */
export function pickDepartmentProducts(
  products: Product[],
  slug: string,
  count: number,
  fallbackPool: Product[] = [],
  config: SelectorConfig = {}
): Product[] {
  const { filterOutOfStock = false } = config;

  // Get weights for this department (default to electronics if not found)
  const weights = DEPARTMENT_WEIGHTS[slug] || DEPARTMENT_WEIGHTS.electronics;

  // Filter out of stock if requested
  let filteredProducts = products;
  if (filterOutOfStock) {
    filteredProducts = products.filter((p) => getEffectiveStock(p) > 0);
  }

  // Score and sort products
  const scored = filteredProducts.map((product) => ({
    product,
    score: calculateScore(product, weights),
  }));

  // Sort by score descending, then by id ascending for stable tie-breaking
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // Stable tie-breaker: use id (string comparison)
    return a.product.id.localeCompare(b.product.id);
  });

  // Extract selected products
  const selected = scored.map((item) => item.product);

  // Track IDs to avoid duplicates when filling from fallback
  const selectedIds = new Set(selected.map((p) => p.id));

  // Fill from fallback pool if needed
  if (selected.length < count && fallbackPool.length > 0) {
    // Score fallback products with same weights
    const fallbackScored = fallbackPool
      .filter((p) => !selectedIds.has(p.id)) // Exclude duplicates
      .map((product) => ({
        product,
        score: calculateScore(product, weights),
      }));

    // Sort fallback by score
    fallbackScored.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.product.id.localeCompare(b.product.id);
    });

    // Add top fallback products until we reach count
    const needed = count - selected.length;
    const fallbackSelected = fallbackScored
      .slice(0, needed)
      .map((item) => item.product);

    selected.push(...fallbackSelected);
  }

  // Return exactly count items (or fewer if not enough available)
  return selected.slice(0, count);
}
