import { apiClient } from "@/lib/api/client";
import type { BackendResponse } from "@/lib/types/api";
import type { Product, ProductFilters, ProductsResponse } from "./types";
import {
  searchProducts as getMockProducts,
  getProductBySlug as getMockProductBySlug,
  getFeaturedProducts as getMockFeaturedProducts,
} from "@/lib/data/products";

export type { Product } from "./types";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

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
    if (USE_MOCKS) {
      // Use the existing mock-aware search function
      const allMatching = await getMockProducts(params.search || "");
      const limit = params.limit || 10;
      const page = params.page || 1;
      const start = (page - 1) * limit;
      const data = allMatching.slice(start, start + limit);

      return {
        data,
        total: allMatching.length,
        page,
        limit,
        totalPages: Math.ceil(allMatching.length / limit),
      };
    }

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
    if (USE_MOCKS) {
      const product = await getMockProductBySlug(slug);
      if (!product) throw new Error("Product not found");
      return product;
    }

    const response = await apiClient.get<BackendResponse<Product>>(
      `/products/${slug}`
    );
    // Extract data from wrapped response
    return response.data.data;
  },

  async getFeaturedProducts(): Promise<Product[]> {
    if (USE_MOCKS) {
      return getMockFeaturedProducts();
    }

    const response = await apiClient.get<BackendResponse<Product[]>>(
      "/products/featured"
    );
    return response.data.data;
  },

  async getLatestProducts(): Promise<Product[]> {
    if (USE_MOCKS) {
      // For now using featured as latest in mocks
      return getMockFeaturedProducts(8);
    }

    const response = await apiClient.get<BackendResponse<Product[]>>(
      "/products/latest"
    );
    return response.data.data;
  },
};
