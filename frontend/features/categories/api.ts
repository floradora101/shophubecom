import { apiClient } from "@/lib/api/client";
import type { BackendResponse } from "@/lib/types/api";
import type { Category } from "@/features/products/types";

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const categoriesApi = {
  async getCategories(): Promise<Category[]> {
    try {
      // Backend now returns paginated response, so we need to fetch all categories
      // Request a large limit to get all categories at once
      const response = await apiClient.get<
        BackendResponse<PaginatedResponse<Category>>
      >("/categories?limit=1000");

      // Backend wraps response in { success, data: { data: [...], meta: {...} }, timestamp }
      const allCategories = response.data.data.data || [];

      // Filter to only return parent categories (categories without parentId)
      return allCategories.filter(
        (category) => !category.parentId || category.parentId === null
      );
    } catch (error) {
      return [];
    }
  },
};
