import { apiClient } from "@/lib/api/client";
import type { BackendResponse } from "@/lib/types/api";
import type { Category } from "@/features/products/types";

// Request payload matching backend DTOs
export interface CreateCategoryPayload {
  name: string;
  description?: string;
  parentId?: string | null;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string | null;
  parentId?: string | null;
}

export const adminCategoriesApi = {
  /**
   * Create a new category
   */
  async createCategory(payload: CreateCategoryPayload): Promise<Category> {
    try {
      const response = await apiClient.post<BackendResponse<Category>>(
        "/categories",
        payload
      );
      return response.data.data;
    } catch (error: unknown) {
      throw error;
    }
  },

  /**
   * Update an existing category
   */
  async updateCategory(
    categoryId: string,
    payload: UpdateCategoryPayload
  ): Promise<Category> {
    try {
      const response = await apiClient.put<BackendResponse<Category>>(
        `/categories/${categoryId}`,
        payload
      );
      return response.data.data;
    } catch (error: unknown) {
      throw error;
    }
  },

  /**
   * Get a single category by ID
   */
  async getCategory(categoryId: string): Promise<Category | null> {
    try {
      const response = await apiClient.get<BackendResponse<Category>>(
        `/categories/${categoryId}`
      );
      return response.data.data;
    } catch (error: unknown) {
      // Return null if category not found (404)
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object"
      ) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          return null;
        }
      }
      throw error;
    }
  },

  /**
   * Get all categories with filtering, pagination, and sorting (for admin)
   */
  async getCategories(params?: {
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: "name" | "createdAt";
    sortOrder?: "asc" | "desc";
  }): Promise<{
    data: Category[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append("search", params.search);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      // Backend wraps response in { success: true, data: {...} }
      const response = await apiClient.get<
        BackendResponse<{
          data: Category[];
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        }>
      >(`/categories?${queryParams.toString()}`);

      // response.data is the wrapped response: { success: true, data: {...}, timestamp: "..." }
      // response.data.data is the actual categories response: { data: [...], total, page, limit, totalPages }
      const categoriesResponse = response.data.data;

      return {
        data: categoriesResponse.data || [],
        total: categoriesResponse.total,
        page: categoriesResponse.page,
        limit: categoriesResponse.limit,
        totalPages: categoriesResponse.totalPages,
      };
    } catch (error: unknown) {
      throw error;
    }
  },

  /**
   * Delete a category
   */
  async deleteCategory(categoryId: string): Promise<{ success: boolean }> {
    try {
      await apiClient.delete(`/categories/${categoryId}`);
      return { success: true };
    } catch (error: unknown) {
      throw error;
    }
  },

  /**
   * Get product count for a category
   * Note: This is now included in the category response, but kept for backward compatibility
   */
  async getCategoryProductCount(categoryId: string): Promise<number> {
    try {
      const category = await this.getCategory(categoryId);
      // Backend includes productCount in the response
      return (
        (category as Category & { productCount?: number })?.productCount || 0
      );
    } catch (error: unknown) {
      return 0;
    }
  },
};
