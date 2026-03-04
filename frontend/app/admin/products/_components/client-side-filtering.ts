/**
 * Client-side filtering utilities for products
 *
 * This file contains client-side filtering and sorting logic that was previously
 * used in the products admin page. It's kept here for potential future use
 * or as a fallback option.
 *
 * Note: The admin page now uses backend filtering via useProductsQuery,
 * but this code is preserved for reference or future client-side filtering needs.
 */

import type { Product } from "@/features/products/types";

type SortOption = "name-asc" | "name-desc" | "price-desc" | "price-asc" | "stock-desc";

/**
 * Filter and sort products on the client side
 *
 * @param products - Array of products to filter
 * @param search - Search query string
 * @param sortBy - Sort option
 * @param selectedCategory - Category slug to filter by, or "all" for all categories
 * @returns Filtered and sorted products
 */
export function filterAndSortProducts(
  products: Product[],
  search: string,
  sortBy: SortOption,
  selectedCategory: string
): Product[] {
  let result = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || p.category?.slug === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  result.sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "price-desc":
        return b.price - a.price;
      case "price-asc":
        return a.price - b.price;
      case "stock-desc":
        return (b.stock || b.effectiveStock || 0) - (a.stock || a.effectiveStock || 0);
      default:
        return 0;
    }
  });

  return result;
}

/**
 * Get category name for a product
 *
 * @param product - Product to get category name for
 * @param categories - Array of categories to search
 * @returns Category name or "Uncategorized"
 */
export function getProductCategoryName(
  product: Product,
  categories: Array<{ id: string; name: string; slug: string }>
): string {
  if (product.category?.name) {
    return product.category.name;
  }

  if (product.categoryId) {
    const category = categories.find((c) => c.id === product.categoryId);
    if (category) {
      return category.name;
    }
  }

  return "Uncategorized";
}