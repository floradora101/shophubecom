import { apiClient } from "@/lib/api/client";
import type { BackendResponse } from "@/lib/types/api";
import {
  extractPaginatedData,
  extractResponseData,
} from "@/lib/api/response-transformer";
import type { Department } from "./types";

export const departmentsApi = {
  /**
   * Public endpoint: active department spotlights for homepage.
   * No auth required.
   */
  async getActiveDepartments(): Promise<Department[]> {
    const response = await apiClient.get<BackendResponse<Department[]>>(
      "/departments/active"
    );
    return extractResponseData(response) ?? [];
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
    const response = await apiClient.get<
      BackendResponse<{
        data: Department[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>
    >("/departments", { params });
    return extractPaginatedData(response);
  },

  async getDepartment(id: string): Promise<Department> {
    const response = await apiClient.get<BackendResponse<Department>>(
      `/departments/${id}`
    );
    return extractResponseData(response);
  },

  async createDepartment(data: {
    name: string;
    parentCategoryId: string;
    highlightedSubCategoryIds: string[];
    isActive: boolean;
  }): Promise<Department> {
    const response = await apiClient.post<BackendResponse<Department>>(
      "/departments",
      data
    );
    return extractResponseData(response);
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
    const response = await apiClient.put<BackendResponse<Department>>(
      `/departments/${id}`,
      data
    );
    return extractResponseData(response);
  },

  async deleteDepartment(id: string): Promise<void> {
    await apiClient.delete(`/departments/${id}`);
  },
};

