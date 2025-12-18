import { apiClient } from "./client";
import type {
  Product,
  ProductFilters,
  ProductsResponse,
} from "@/lib/types/product.types";

export type { Product } from "@/lib/types/product.types";

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

// Backend wraps responses in { success: true, data: ... }
interface BackendResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const productsApi = {
  async getProducts(params: ProductsQueryParams = {}): Promise<ProductsResult> {
    const response = await apiClient.get<
      BackendResponse<{
        data: Product[];
        total: number;
        page: number;
        limit: number;
      }>
    >("/products", { params });

    const { data, total, page, limit } = response.data.data;
    const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));

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
};
