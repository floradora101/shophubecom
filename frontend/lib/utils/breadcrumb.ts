/**
 * Breadcrumb utilities for category hierarchy.
 *
 * Builds ancestry chains for nested categories to support
 * full breadcrumb paths: Home > Products > Parent > Child > Product
 */

import type { Category } from "@/features/products/types";

/**
 * Get the full ancestry chain for a category (root → ... → category).
 * Returns categories in display order for breadcrumb rendering.
 *
 * @param category - The leaf category
 * @param categories - Flat list of all categories (for parent lookup)
 * @returns Array of categories from root to the given category
 */
export function getCategoryAncestry(
  category: Category,
  categories: Category[]
): Category[] {
  const path: Category[] = [];
  let current: Category | undefined = category;

  while (current) {
    path.unshift(current);
    current = current.parentId
      ? (categories.find((c) => c.id === current!.parentId) ?? undefined)
      : undefined;
  }

  return path;
}
