// Products data layer - abstracts mock data from UI components
import {
  mockProducts,
  mockProductToProduct,
  type MockProduct,
} from "@/lib/mock-data/mock-data";
import type { Product } from "@/features/products/types";

// Check if we should use mock data (default: true)
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

/**
 * Get all products (synchronous for server components)
 */
export function getAllProductsSync(): Product[] {
  if (USE_MOCKS) {
    return mockProducts.map(mockProductToProduct);
  }

  throw new Error("API implementation not yet available - use async version");
}

/**
 * Get all products
 */
export async function getAllProducts(): Promise<Product[]> {
  if (USE_MOCKS) {
    return mockProducts.map(mockProductToProduct);
  }

  // TODO: Replace with actual API call when backend is ready
  throw new Error("API implementation not yet available");
}

/**
 * Get product by slug (synchronous for server components)
 */
export function getProductBySlugSync(slug: string): Product | null {
  if (USE_MOCKS) {
    const mockProduct = mockProducts.find(p => p.slug === slug);
    return mockProduct ? mockProductToProduct(mockProduct) : null;
  }

  throw new Error("API implementation not yet available - use async version");
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (USE_MOCKS) {
    const mockProduct = mockProducts.find(p => p.slug === slug);
    return mockProduct ? mockProductToProduct(mockProduct) : null;
  }

  // TODO: Replace with actual API call when backend is ready
  throw new Error("API implementation not yet available");
}

/**
 * Get products by category slug
 */
export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  if (USE_MOCKS) {
    return mockProducts
      .filter(p => p.categorySlug === categorySlug)
      .map(mockProductToProduct);
  }

  // TODO: Replace with actual API call when backend is ready
  throw new Error("API implementation not yet available");
}

/**
 * Search products by query
 */
export async function searchProducts(query: string): Promise<Product[]> {
  if (USE_MOCKS) {
    const lowercaseQuery = query.toLowerCase();
    return mockProducts
      .filter(p =>
        p.name.toLowerCase().includes(lowercaseQuery) ||
        p.description?.toLowerCase().includes(lowercaseQuery) ||
        p.categorySlug?.toLowerCase().includes(lowercaseQuery)
      )
      .map(mockProductToProduct);
  }

  // TODO: Replace with actual API call when backend is ready
  throw new Error("API implementation not yet available");
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
  if (USE_MOCKS) {
    return mockProducts.slice(0, limit).map(mockProductToProduct);
  }

  // TODO: Replace with actual API call when backend is ready
  throw new Error("API implementation not yet available");
}

/**
 * Get products for homepage category sections
 */
export async function getProductsByCategoryPrefix(
  categoryPrefixes: string[],
  limit: number = 8
): Promise<Product[]> {
  if (USE_MOCKS) {
    return mockProducts
      .filter(p =>
        categoryPrefixes.some(prefix =>
          p.categorySlug?.startsWith(prefix) || p.categorySlug === prefix
        )
      )
      .slice(0, limit)
      .map(mockProductToProduct);
  }

  // TODO: Replace with actual API call when backend is ready
  throw new Error("API implementation not yet available");
}
