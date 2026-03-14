/**
 * Products data layer - mock data and server-side helpers.
 *
 * @deprecated Prefer features/products/api.ts for client-side. This file remains
 * for sync helpers used in server components (generateMetadata) and mock mode.
 * Backend API is ready - use productsApi when USE_MOCKS=false.
 *
 * Mock data is loaded via dynamic import() so it is tree-shaken from production.
 * Uses fetch for server-side (no cookies); errors include status for debugging.
 */
import type { Product } from "@/features/products/types";

import { USE_MOCKS } from "@/lib/flags";

const API_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001/api";

/** Thrown when fetch fails; includes status for proper error handling */
class ProductsFetchError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly url: string
  ) {
    super(message);
    this.name = "ProductsFetchError";
  }
}

/**
 * Extract product array from backend response.
 * Handles: findAll/search shape { data: { data: Product[], total, ... } } and featured shape { data: Product[] }.
 */
function extractProductList(json: unknown): Product[] {
  const wrapped = (json as { data?: unknown })?.data;
  if (Array.isArray(wrapped)) return wrapped;
  const inner = (wrapped as { data?: Product[] })?.data;
  return Array.isArray(inner) ? inner : [];
}

/** Extract single product from backend response { success, data: Product }. */
function extractProduct(json: unknown): Product | null {
  const data = (json as { data?: Product })?.data;
  return data && typeof data === "object" && data !== null ? data : null;
}

/**
 * Get all products (async). Use features/products/api.ts getProducts() when not using mocks.
 */
export async function getAllProducts(): Promise<Product[]> {
  if (USE_MOCKS) {
    const { mockProducts, mockProductToProduct } = await import(
      "@/lib/mock-data/mock-data"
    ).catch((err) => {
      throw new Error(`Failed to load mock products: ${err instanceof Error ? err.message : "Unknown error"}`);
    });
    return mockProducts.map(mockProductToProduct);
  }
  const url = `${API_URL}/products?limit=100`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new ProductsFetchError(`Failed to fetch products (${res.status})`, res.status, url);
  }
  const json = await res.json();
  return extractProductList(json);
}

/**
 * Get product by slug for server components (async). Uses API when USE_MOCKS=false.
 */
export async function getProductBySlugForServer(
  slug: string
): Promise<Product | null> {
  if (USE_MOCKS) {
    const { mockProducts, mockProductToProduct } = await import(
      "@/lib/mock-data/mock-data"
    ).catch((err) => {
      throw new Error(`Failed to load mock products: ${err instanceof Error ? err.message : "Unknown error"}`);
    });
    const mockProduct = mockProducts.find((p) => p.slug === slug);
    return mockProduct ? mockProductToProduct(mockProduct) : null;
  }
  const url = `${API_URL}/products/${encodeURIComponent(slug)}`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new ProductsFetchError(`Failed to fetch product (${res.status})`, res.status, url);
  }
  const json = await res.json();
  return extractProduct(json);
}

/**
 * Get product by slug (async). Use features/products/api.ts getProductBySlug() when not using mocks.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (USE_MOCKS) {
    const { mockProducts, mockProductToProduct } = await import(
      "@/lib/mock-data/mock-data"
    ).catch((err) => {
      throw new Error(`Failed to load mock products: ${err instanceof Error ? err.message : "Unknown error"}`);
    });
    const mockProduct = mockProducts.find((p) => p.slug === slug);
    return mockProduct ? mockProductToProduct(mockProduct) : null;
  }
  const url = `${API_URL}/products/${encodeURIComponent(slug)}`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new ProductsFetchError(`Failed to fetch product (${res.status})`, res.status, url);
  }
  const json = await res.json();
  return extractProduct(json);
}

/**
 * Search products by query. Used by features/products/api.ts in mock mode.
 */
export async function searchProducts(query: string): Promise<Product[]> {
  if (USE_MOCKS) {
    const { mockProducts, mockProductToProduct } = await import(
      "@/lib/mock-data/mock-data"
    ).catch((err) => {
      throw new Error(`Failed to load mock products: ${err instanceof Error ? err.message : "Unknown error"}`);
    });
    const lowercaseQuery = query.toLowerCase();
    return mockProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(lowercaseQuery) ||
          p.description?.toLowerCase().includes(lowercaseQuery) ||
          p.categorySlug?.toLowerCase().includes(lowercaseQuery)
      )
      .map(mockProductToProduct);
  }
  const url = `${API_URL}/products?search=${encodeURIComponent(query)}&limit=100`;
  const res = await fetch(url);
  if (!res.ok) throw new ProductsFetchError(`Failed to search products (${res.status})`, res.status, url);
  const json = await res.json();
  return json?.data?.data ?? json?.data ?? [];
}

/**
 * Get featured products. Use features/products/api.ts getFeaturedProducts() when not using mocks.
 */
export async function getFeaturedProducts(
  limit: number = 8
): Promise<Product[]> {
  if (USE_MOCKS) {
    const { mockProducts, mockProductToProduct } = await import(
      "@/lib/mock-data/mock-data"
    ).catch((err) => {
      throw new Error(`Failed to load mock products: ${err instanceof Error ? err.message : "Unknown error"}`);
    });
    return mockProducts.slice(0, limit).map(mockProductToProduct);
  }
  const url = `${API_URL}/products/featured`;
  const res = await fetch(url);
  if (!res.ok) throw new ProductsFetchError(`Failed to fetch featured products (${res.status})`, res.status, url);
  const json = await res.json();
  const list = extractProductList(json);
  return list.slice(0, limit);
}

/**
 * Get products for homepage category sections.
 * In API mode: fetches products and filters by category slug matching any prefix.
 */
export async function getProductsByCategoryPrefix(
  categoryPrefixes: string[],
  limit: number = 8
): Promise<Product[]> {
  if (USE_MOCKS) {
    const { mockProducts, mockProductToProduct } = await import(
      "@/lib/mock-data/mock-data"
    ).catch((err) => {
      throw new Error(`Failed to load mock products: ${err instanceof Error ? err.message : "Unknown error"}`);
    });
    return mockProducts
      .filter((p) =>
        categoryPrefixes.some(
          (prefix) =>
            p.categorySlug?.startsWith(prefix) || p.categorySlug === prefix
        )
      )
      .slice(0, limit)
      .map(mockProductToProduct);
  }
  // API mode: fetch products (backend includes category with slug) and filter by prefix
  const url = `${API_URL}/products?limit=100&sortBy=createdAt&sortOrder=desc`;
  const res = await fetch(url);
  if (!res.ok) throw new ProductsFetchError(`Failed to fetch products (${res.status})`, res.status, url);
  const json = await res.json();
  const all = extractProductList(json);
  const matchesPrefix = (slug: string | undefined) =>
    slug && categoryPrefixes.some((p) => slug === p || slug.startsWith(`${p}-`));
  return all
    .filter((p) => matchesPrefix(p.category?.slug))
    .slice(0, limit);
}
