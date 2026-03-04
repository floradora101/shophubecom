/**
 * @file routes.ts
 *
 * Centralized frontend route builders for navigation.
 * Single source of truth for product, category, and search URLs.
 *
 * Use these instead of hardcoding paths for:
 * - Link href
 * - router.push / router.replace
 * - Path comparisons (isCategoryPage, etc.)
 *
 * Note: API endpoints (e.g. /api/*, backend /products) are NOT defined here.
 */

// =============================================================================
// Product & Category Routes
// =============================================================================

export const productRoutes = {
  /** All products listing */
  list: () => "/products",

  /** Category-filtered listing: /products/category/[slug] */
  category: (slug: string) => `/products/category/${slug}`,

  /** Product detail: /products/[slug] */
  detail: (slug: string) => `/products/${slug}`,
} as const;

/** Path constants for prefix checks (e.g. in useProductFilters, middleware) */
export const productPaths = {
  list: "/products",
  categoryPrefix: "/products/category/",
} as const;

/** True if pathname is a category listing (has slug after /products/category/) */
export function isProductCategoryPath(pathname: string): boolean {
  return pathname.startsWith(productPaths.categoryPrefix);
}

/** True if pathname is exactly /products/category with no slug (invalid/ambiguous) */
export function isProductsCategoryOnly(pathname: string): boolean {
  return (
    pathname === "/products/category" || pathname === "/products/category/"
  );
}
