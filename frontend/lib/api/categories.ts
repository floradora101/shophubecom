import { apiClient } from "./client";
import type { Category } from "@/lib/types/product.types";

interface BackendResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

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
      return response.data.data.data || [];
    } catch (error) {
      console.error("Failed to load categories:", error);
      return [];
    }
  },
};
