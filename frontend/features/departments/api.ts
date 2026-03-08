import {
  apiGet,
  apiGetWithParams,
  apiPost,
  apiPut,
  apiDelete,
} from "@/lib/api/request";
import type { Department } from "./types";

export const departmentsApi = {
  /**
   * Public endpoint: active department spotlights for homepage.
   * No auth required.
   */
  async getActiveDepartments(): Promise<Department[]> {
    const data = await apiGet<Department[]>("/departments/active");
    return data ?? [];
  },

  async getDepartments(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: "name" | "createdAt";
    sortOrder?: "asc" | "desc";
  }): Promise<{
    data: Department[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return apiGetWithParams("/departments", params);
  },

  async getDepartment(id: string): Promise<Department> {
    return apiGet<Department>(`/departments/${id}`);
  },

  async createDepartment(data: {
    name: string;
    parentCategoryId: string;
    highlightedSubCategoryIds: string[];
    isActive: boolean;
  }): Promise<Department> {
    return apiPost<Department>("/departments", data);
  },

  async updateDepartment(
    id: string,
    data: Partial<{
      name: string;
      parentCategoryId: string;
      highlightedSubCategoryIds: string[];
      isActive: boolean;
    }>
  ): Promise<Department> {
    return apiPut<Department>(`/departments/${id}`, data);
  },

  async deleteDepartment(id: string): Promise<void> {
    await apiDelete<void>(`/departments/${id}`);
  },
};

