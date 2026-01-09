// Categories data layer - abstracts mock data from UI components
import {
  mockCategories,
  mockCategoryToCategory,
  getMainCategories as mockGetMainCategories,
  getSubcategories as mockGetSubcategories,
} from "@/lib/mock-data/mock-data";
import type { Category } from "@/features/products/types";

// Check if we should use mock data (default: true)
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

/**
 * Get all categories
 */
export async function getAllCategories(): Promise<Category[]> {
  if (USE_MOCKS) {
    return mockCategories.map(mockCategoryToCategory);
  }

  // TODO: Replace with actual API call when backend is ready
  throw new Error("API implementation not yet available");
}

/**
 * Get main categories (top-level categories)
 */
export async function getMainCategories(): Promise<Category[]> {
  if (USE_MOCKS) {
    return mockGetMainCategories().map(mockCategoryToCategory);
  }

  // TODO: Replace with actual API call when backend is ready
  throw new Error("API implementation not yet available");
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
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (USE_MOCKS) {
    const mockCategory = mockCategories.find(c => c.slug === slug);
    return mockCategory ? mockCategoryToCategory(mockCategory) : null;
  }

  // TODO: Replace with actual API call when backend is ready
  throw new Error("API implementation not yet available");
}
