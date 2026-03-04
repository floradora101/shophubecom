import { apiClient } from "@/lib/api/client";
import type { BackendResponse } from "@/lib/types/api";
import type { Category } from "@/features/products/types";
import {
  extractPaginatedData,
  extractResponseData,
} from "@/lib/api/response-transformer";

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
    const response = await apiClient.get<
      BackendResponse<{
        data: Category[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>
    >("/categories", { params });
    return extractPaginatedData(response);
  },

  /**
   * Get all categories as a hierarchical tree
   * Returns only root categories with children populated recursively
   * Useful for navigation menus and category pickers
   */
  async getCategoriesTree(): Promise<Category[]> {
    const response = await apiClient.get<BackendResponse<Category[]>>(
      "/categories/tree"
    );
    return extractResponseData(response);
  },

  /**
   * Get a single category by ID or slug
   */
  async getCategoryByIdOrSlug(idOrSlug: string): Promise<Category> {
    const response = await apiClient.get<BackendResponse<Category>>(
      `/categories/${idOrSlug}`
    );
    return extractResponseData(response);
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
    const response = await apiClient.post<BackendResponse<Category>>(
      "/categories",
      data
    );
    return extractResponseData(response);
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
    const response = await apiClient.put<BackendResponse<Category>>(
      `/categories/${id}`,
      data
    );
    return extractResponseData(response);
  },

  /**
   * Delete a category
   * Admin-only endpoint
   */
  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },
};
