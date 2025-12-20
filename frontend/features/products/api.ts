import { apiClient } from "@/lib/api/client";
import type { BackendResponse } from "@/lib/types/api";
import type { Product, ProductFilters, ProductsResponse } from "./types";

export type { Product } from "./types";

export interface ProductsQueryParams
  extends Pick<
    ProductFilters,
    "page" | "limit" | "categoryId" | "minPrice" | "maxPrice" | "search"
  > {
  sortBy?: "price" | "name" | "createdAt";
  sortOrder?: "asc" | "desc";
  inStockOnly?: boolean;
}

export interface ProductsResult {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const productsApi = {
  async getProducts(params: ProductsQueryParams = {}): Promise<ProductsResult> {
    const response = await apiClient.get<
      BackendResponse<{
        data: Product[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>
    >("/products", { params });

    const { data, total, page, limit, totalPages } = response.data.data;

    const normalized: ProductsResponse = {
      data,
      meta: { total, page, limit, totalPages },
    };

    return {
      ...normalized,
      ...normalized.meta,
    };
  },

  async getProductBySlug(slug: string): Promise<Product> {
    const response = await apiClient.get<BackendResponse<Product>>(
      `/products/${slug}`
    );
    // Extract data from wrapped response
    return response.data.data;
  },

  async getFeaturedProducts(): Promise<Product[]> {
    const response = await apiClient.get<BackendResponse<Product[]>>(
      "/products/featured"
    );
    return response.data.data;
  },

  async getLatestProducts(): Promise<Product[]> {
    const response = await apiClient.get<BackendResponse<Product[]>>(
      "/products/latest"
    );
    return response.data.data;
  },
};
