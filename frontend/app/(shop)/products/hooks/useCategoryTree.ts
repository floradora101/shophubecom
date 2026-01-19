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
import type { Category } from "@/features/products/types";
import type { CategoryTreeHelpers } from "@/features/products/utils/productFiltering";

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
 * Hook for managing category tree and related helpers
 */
export function useCategoryTree({
  hasInteracted = true,
  categorySlug,
}: UseCategoryTreeProps): UseCategoryTreeReturn {
  // Use mock categories - only compute when user has interacted
  const categories = useMemo(() => {
    if (!hasInteracted) return [];
    return mockCategories.map(mockCategoryToCategory);
  }, [hasInteracted]);

  // Build category tree helpers for filtering - only when user has interacted
  const categoryTreeHelpers = useMemo((): CategoryTreeHelpers => {
    if (!hasInteracted) {
      return { categoryIdMap: new Map(), getDescendantIds: () => new Set() };
    }

    // Compute categories internally to avoid dependency issues
    const computedCategories = mockCategories.map(mockCategoryToCategory);
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
  }, [hasInteracted]);

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
