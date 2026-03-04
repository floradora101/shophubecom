/**
 * Products data layer - mock data and server-side helpers.
 *
 * @deprecated Prefer features/products/api.ts for client-side. This file remains
 * for sync helpers used in server components (generateMetadata) and mock mode.
 * Backend API is ready - use productsApi when USE_MOCKS=false.
 */
import {
  mockProducts,
  mockProductToProduct,
  type MockProduct,
} from "@/lib/mock-data/mock-data";
import type { Product } from "@/features/products/types";

import { USE_MOCKS } from "@/lib/flags";
const API_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001/api";

/**
 * Get all products (synchronous) - mocks only. Used when USE_MOCKS=true.
 */
export function getAllProductsSync(): Product[] {
  // Always return mocks for sync version to prevent server crashes
  return mockProducts.map(mockProductToProduct);
}

/**
 * Get all products (async). Use features/products/api.ts getProducts() when not using mocks.
 */
export async function getAllProducts(): Promise<Product[]> {
  if (USE_MOCKS) {
    return mockProducts.map(mockProductToProduct);
  }
  const res = await fetch(`${API_URL}/products?limit=100`);
  if (!res.ok) throw new Error("Failed to fetch products");
  const json = await res.json();
  return json?.data?.data ?? json?.data ?? [];
}

/**
 * Get product by slug (synchronous) - mocks only. For server metadata when USE_MOCKS=true.
 */
export function getProductBySlugSync(slug: string): Product | null {
  const mockProduct = mockProducts.find((p) => p.slug === slug);
  return mockProduct ? mockProductToProduct(mockProduct) : null;
}

/**
 * Get product by slug for server components (async). Uses API when USE_MOCKS=false.
 */
export async function getProductBySlugForServer(
  slug: string
): Promise<Product | null> {
  if (USE_MOCKS) {
    return getProductBySlugSync(slug);
  }
  const res = await fetch(`${API_URL}/products/${encodeURIComponent(slug)}`);
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data ?? null;
}

/**
 * Get product by slug (async). Use features/products/api.ts getProductBySlug() when not using mocks.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (USE_MOCKS) {
    const mockProduct = mockProducts.find((p) => p.slug === slug);
    return mockProduct ? mockProductToProduct(mockProduct) : null;
  }
  const res = await fetch(`${API_URL}/products/${encodeURIComponent(slug)}`);
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data ?? null;
}

/**
 * Get products by category slug. Use features/products/api.ts getProducts({ categoryId }) when not using mocks.
 * Backend expects categoryId (cuid), not slug - callers must resolve slug→id first.
 */
export async function getProductsByCategory(
  categorySlug: string
): Promise<Product[]> {
  if (USE_MOCKS) {
    return mockProducts
      .filter((p) => p.categorySlug === categorySlug)
      .map(mockProductToProduct);
  }
  throw new Error(
    "Use features/products/api.getProducts({ categoryId }) - backend requires category ID"
  );
}

/**
 * Search products by query. Used by features/products/api.ts in mock mode.
 */
export async function searchProducts(query: string): Promise<Product[]> {
  if (USE_MOCKS) {
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
  const res = await fetch(
    `${API_URL}/products?search=${encodeURIComponent(query)}&limit=100`
  );
  if (!res.ok) throw new Error("Failed to search products");
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
    return mockProducts.slice(0, limit).map(mockProductToProduct);
  }
  const res = await fetch(`${API_URL}/products/featured`);
  if (!res.ok) throw new Error("Failed to fetch featured products");
  const json = await res.json();
  const data = json?.data ?? [];
  return Array.isArray(data) ? data.slice(0, limit) : [];
}

/**
 * Get products for homepage category sections. Mock-only; use features/products/api when not using mocks.
 */
export async function getProductsByCategoryPrefix(
  categoryPrefixes: string[],
  limit: number = 8
): Promise<Product[]> {
  if (USE_MOCKS) {
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
  const res = await fetch(`${API_URL}/products?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  const json = await res.json();
  const data = json?.data?.data ?? json?.data ?? [];
  return Array.isArray(data) ? data.slice(0, limit) : [];
}
