import {
  apiGet,
  apiGetWithParams,
  apiPost,
  apiPut,
  apiDelete,
} from "@/lib/api/request";
import type { Category } from "@/features/products/types";

export const categoriesApi = {
  /**
   * Get all categories (flat list)
   * Returns all categories with pagination support
   */
  async getCategories(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "name" | "createdAt";
    sortOrder?: "asc" | "desc";
  }): Promise<{
    data: Category[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return apiGetWithParams("/categories", params);
  },

  /**
   * Get all categories as a hierarchical tree
   * Returns only root categories with children populated recursively
   * Useful for navigation menus and category pickers
   */
  async getCategoriesTree(): Promise<Category[]> {
    return apiGet<Category[]>("/categories/tree");
  },

  /**
   * Get a single category by ID or slug
   */
  async getCategoryByIdOrSlug(idOrSlug: string): Promise<Category> {
    return apiGet<Category>(`/categories/${idOrSlug}`);
  },

  /**
   * Create a new category
   * Admin-only endpoint
   */
  async createCategory(data: {
    name: string;
    description?: string | null;
    parentId?: string | null;
  }): Promise<Category> {
    return apiPost<Category>("/categories", data);
  },

  /**
   * Update an existing category
   * Admin-only endpoint
   */
  async updateCategory(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      parentId?: string | null;
    }
  ): Promise<Category> {
    return apiPut<Category>(`/categories/${id}`, data);
  },

  /**
   * Delete a category
   * Admin-only endpoint
   */
  async deleteCategory(id: string): Promise<void> {
    await apiDelete<void>(`/categories/${id}`);
  },
};
