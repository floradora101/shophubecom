// Categories data layer - abstracts mock data from UI components
import {
  mockCategories,
  mockCategoryToCategory,
  getMainCategories as mockGetMainCategories,
  getSubcategories as mockGetSubcategories,
} from "@/lib/mock-data/mock-data";
import type { Category } from "@/features/products/types";

import { USE_MOCKS } from "@/lib/flags";

/**
 * Get all categories
 */
export async function getAllCategories(): Promise<Category[]> {
  if (USE_MOCKS) {
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
    return mockGetSubcategories(parentId).map(mockCategoryToCategory);
  }

  // TODO: Replace with actual API call when backend is ready
  throw new Error("API implementation not yet available");
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  if (USE_MOCKS) {
    const mockCategory = mockCategories.find((c) => c.slug === slug);
    return mockCategory ? mockCategoryToCategory(mockCategory) : null;
  }

  // TODO: Replace with actual API call when backend is ready
  throw new Error("API implementation not yet available");
}



