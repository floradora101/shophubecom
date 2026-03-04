/**
 * useCategoryTree Hook
 *
 * Handles category tree building and provides category-related helpers.
 *
 * Responsibilities:
 * - Load and normalize categories from mock data
 * - Build category tree structure
 * - Generate category helpers (maps, descendant functions)
 * - Provide current category lookup
 */

import { useMemo } from "react";
import {
  mockCategories,
  mockCategoryToCategory,
} from "@/lib/mock-data/mock-data";
import { useCategoriesTreeQuery } from "@/features/categories/queries";
import type { Category } from "@/features/products/types";
import type { CategoryTreeHelpers } from "@/features/products/utils/productFiltering";
import { USE_MOCKS } from "@/lib/flags";

interface UseCategoryTreeProps {
  hasInteracted?: boolean;
  categorySlug?: string | null;
}

interface UseCategoryTreeReturn {
  categories: Category[];
  categoryTreeHelpers: CategoryTreeHelpers;
  currentCategory: Category | undefined;
}

/**
 * Flatten a hierarchical category tree into a flat list
 * Recursively extracts all categories including nested children
 */
export function flattenCategoryTree(
  tree: Category[],
  result: Category[] = []
): Category[] {
  for (const category of tree) {
    // Add the category itself
    result.push(category);

    // Recursively flatten children if they exist
    if ((category as any).children && Array.isArray((category as any).children)) {
      flattenCategoryTree((category as any).children, result);
    }
  }
  return result;
}

/**
 * Hook for managing category tree and related helpers
 */
export function useCategoryTree({
  hasInteracted = true,
  categorySlug,
}: UseCategoryTreeProps): UseCategoryTreeReturn {
  // Fetch categories from API
  const { data: apiCategories = [], isLoading: categoriesLoading } = useCategoriesTreeQuery();

  // Flatten categories tree into a flat list for filtering and lookup
  // Use mock categories if mocks are enabled, otherwise flatten API categories tree
  const categories = useMemo(() => {
    if (!hasInteracted) return [];
    if (USE_MOCKS) {
      return mockCategories.map(mockCategoryToCategory);
    }
    // Flatten the hierarchical tree structure into a flat list
    return flattenCategoryTree(apiCategories);
  }, [hasInteracted, apiCategories]);

  // Build category tree helpers for filtering - only when user has interacted
  const categoryTreeHelpers = useMemo((): CategoryTreeHelpers => {
    if (!hasInteracted) {
      return { categoryIdMap: new Map(), getDescendantIds: () => new Set() };
    }

    // Use flattened categories list (either API or mocks)
    const computedCategories = categories;
    const categoryIdMap = new Map<string, string>();
    const childrenByParentId = new Map<string, string[]>();

    computedCategories.forEach((cat) => {
      categoryIdMap.set(cat.slug, cat.id);
      if (cat.parentId) {
        childrenByParentId.set(cat.parentId, [
          ...(childrenByParentId.get(cat.parentId) ?? []),
          cat.id,
        ]);
      }
    });

    const getDescendantIds = (rootId: string): Set<string> => {
      const out = new Set<string>([rootId]);
      const stack = [rootId];

      while (stack.length) {
        const current = stack.pop()!;
        const kids = childrenByParentId.get(current) ?? [];
        for (const k of kids) {
          if (!out.has(k)) {
            out.add(k);
            stack.push(k);
          }
        }
      }
      return out;
    };

    return { categoryIdMap, getDescendantIds };
  }, [hasInteracted, categories]);

  // Get current category by slug
  const currentCategory = useMemo(() => {
    if (!categorySlug) return undefined;
    return categories.find((c) => c.slug === categorySlug);
  }, [categories, categorySlug]);

  return {
    categories,
    categoryTreeHelpers,
    currentCategory,
  };
}
