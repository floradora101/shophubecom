import { apiClient } from "@/lib/api/client";
import type { BackendResponse } from "@/lib/types/api";
import type { AdminProduct } from "../types";

// Request payload matching backend DTOs
// Note: price and stock are NOT included - they are derived from variants
export interface CreateProductPayload {
  name: string;
  description: string;
  currency?: string;
  categoryId: string;
  isActive?: boolean;
  isOnSale?: boolean;
  discountType?: "PERCENTAGE" | "FIXED_AMOUNT" | null;
  discountValue?: number | null;
  saleStartsAt?: string | null;
  saleEndsAt?: string | null;
  variants: Array<{
    sku: string;
    price: number;
    stock: number;
    image?: string;
    images?: string[];
    options?: Record<string, string>;
  }>;
}

// Note: price and stock are NOT included - they are derived from variants
export interface UpdateProductPayload {
  name?: string;
  description?: string;
  currency?: string;
  categoryId?: string;
  isActive?: boolean;
  isOnSale?: boolean;
  discountType?: "PERCENTAGE" | "FIXED_AMOUNT" | null;
  discountValue?: number | null;
  saleStartsAt?: string | null;
  saleEndsAt?: string | null;
  defaultVariantId?: string | null;
  variants?: Array<{
    id?: string;
    sku: string;
    price: number;
    stock: number;
    image?: string;
    images?: string[];
    options?: Record<string, string>;
  }>;
}

export const adminProductsApi = {
  /**
   * Create a new product
   * Variants are required - at least 1 variant must be provided
   */
  async createProduct(payload: CreateProductPayload): Promise<AdminProduct> {
    try {
      const response = await apiClient.post<BackendResponse<AdminProduct>>(
        "/products",
        payload
      );
      return response.data.data;
    } catch (error: unknown) {
      throw error;
    }
  },

  /**
   * Update an existing product
   * If variants are provided, they will replace all existing variants
   */
  async updateProduct(
    productId: string,
    payload: UpdateProductPayload
  ): Promise<AdminProduct> {
    try {
      const response = await apiClient.put<BackendResponse<AdminProduct>>(
        `/products/${productId}`,
        payload
      );
      return response.data.data;
    } catch (error: unknown) {
      throw error;
    }
  },

  /**
   * Get a single product by ID (for admin)
   */
  async getProduct(productId: string): Promise<AdminProduct> {
    const response = await apiClient.get<BackendResponse<AdminProduct>>(
      `/products/${productId}`
    );
    return response.data.data;
  },

  /**
   * Get all products with filtering, pagination, and sorting (for admin)
   * Note: Backend shows all products (including inactive) for authenticated admin users
   */
  async getProducts(params?: {
    search?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
    sortBy?: "name" | "price" | "createdAt";
    sortOrder?: "asc" | "desc";
  }): Promise<{
    data: AdminProduct[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append("search", params.search);
      if (params?.categoryId)
        queryParams.append("categoryId", params.categoryId);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      // Backend wraps response in { success: true, data: {...} }
      const response = await apiClient.get<
        BackendResponse<{
          data: AdminProduct[];
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        }>
      >(`/products?${queryParams.toString()}`);

      // response.data is the wrapped response: { success: true, data: {...}, timestamp: "..." }
      // response.data.data is the actual products response: { data: [...], total, page, limit, totalPages }
      const productsResponse = response.data.data;

      return {
        data: productsResponse.data || [],
        total: productsResponse.total,
        page: productsResponse.page,
        limit: productsResponse.limit,
        totalPages: productsResponse.totalPages,
      };
    } catch (error: unknown) {
      throw error;
    }
  },

  /**
   * Delete a product (soft delete if has orders/cart items, hard delete otherwise)
   */
  async deleteProduct(productId: string): Promise<{ success: boolean }> {
    try {
      await apiClient.delete(`/products/${productId}`);
      return { success: true };
    } catch (error: unknown) {
      throw error;
    }
  },
};
