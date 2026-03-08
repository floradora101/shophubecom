// Categories data layer - abstracts mock data from UI components.
// Mock data loaded via dynamic import() so it is tree-shaken from production.
import type { Category } from "@/features/products/types";
import { ApiRequestError } from "@/lib/api/request";

import { USE_MOCKS } from "@/lib/flags";

function flattenCategories(categories: Category[]): Category[] {
  return categories.flatMap((category) => [
    category,
    ...(category.children?.length ? flattenCategories(category.children) : []),
  ]);
}

/**
 * Get all categories
 */
export async function getAllCategories(): Promise<Category[]> {
  if (USE_MOCKS) {
    const { mockCategories, mockCategoryToCategory } = await import(
      "@/lib/mock-data/mock-data"
    ).catch((err) => {
      throw new Error(`Failed to load mock categories: ${err instanceof Error ? err.message : "Unknown error"}`);
    });
    return mockCategories.map(mockCategoryToCategory);
  }

  // Use API to fetch categories
  const { categoriesApi } = await import("@/features/categories/api");
  try {
    const response = await categoriesApi.getCategories({ limit: 200 });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories from API:", error);
    throw error;
  }
}

/**
 * Get main categories (top-level categories)
 */
export async function getMainCategories(): Promise<Category[]> {
  if (USE_MOCKS) {
    const {
      getMainCategories: mockGetMainCategories,
      mockCategoryToCategory,
    } = await import("@/lib/mock-data/mock-data").catch((err) => {
      throw new Error(`Failed to load mock categories: ${err instanceof Error ? err.message : "Unknown error"}`);
    });
    return mockGetMainCategories().map(mockCategoryToCategory);
  }

  // Use API to fetch category tree and filter root categories
  const { categoriesApi } = await import("@/features/categories/api");
  try {
    const categoriesTree = await categoriesApi.getCategoriesTree();
    // Return only root categories (no parentId)
    return categoriesTree.filter(cat => !cat.parentId);
  } catch (error) {
    console.error("Failed to fetch main categories from API:", error);
    throw error;
  }
}

/**
 * Get subcategories for a parent category
 */
export async function getSubcategories(parentId: string): Promise<Category[]> {
  if (USE_MOCKS) {
    const {
      getSubcategories: mockGetSubcategories,
      mockCategoryToCategory,
    } = await import("@/lib/mock-data/mock-data").catch((err) => {
      throw new Error(`Failed to load mock categories: ${err instanceof Error ? err.message : "Unknown error"}`);
    });
    return mockGetSubcategories(parentId).map(mockCategoryToCategory);
  }

  const { categoriesApi } = await import("@/features/categories/api");
  try {
    const categoriesTree = await categoriesApi.getCategoriesTree();
    return flattenCategories(categoriesTree).filter(
      (category) => category.parentId === parentId
    );
  } catch (error) {
    console.error("Failed to fetch subcategories from API:", error);
    throw error;
  }
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  if (USE_MOCKS) {
    const { mockCategories, mockCategoryToCategory } = await import(
      "@/lib/mock-data/mock-data"
    ).catch((err) => {
      throw new Error(`Failed to load mock categories: ${err instanceof Error ? err.message : "Unknown error"}`);
    });
    const mockCategory = mockCategories.find((c) => c.slug === slug);
    return mockCategory ? mockCategoryToCategory(mockCategory) : null;
  }

  const { categoriesApi } = await import("@/features/categories/api");
  try {
    return await categoriesApi.getCategoryByIdOrSlug(slug);
  } catch (error) {
    if (error instanceof ApiRequestError && error.isNotFound) {
      return null;
    }
    console.error("Failed to fetch category by slug from API:", error);
    throw error;
  }
}



