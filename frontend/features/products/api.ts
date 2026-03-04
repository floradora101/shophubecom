import { apiClient } from "@/lib/api/client";
import type { BackendResponse } from "@/lib/types/api";
import type { Product, ProductFilters, ProductsResponse } from "./types";
import { extractResponseData, extractPaginatedData } from "@/lib/api/response-transformer";
import { USE_MOCKS } from "@/lib/flags";
import { getDiscountInfo } from "@/lib/utils/products";
import {
  searchProducts as getMockProducts,
  getProductBySlug as getMockProductBySlug,
  getFeaturedProducts as getMockFeaturedProducts,
} from "@/lib/data/products";

export type { Product } from "./types";

export interface ProductsQueryParams
  extends Pick<
    ProductFilters,
    "page" | "limit" | "categoryId" | "minPrice" | "maxPrice" | "search" | "promotionId"
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
      const limit = params.limit || 10;
      const page = params.page || 1;
      const sortBy = params.sortBy || "createdAt";
      const sortOrder = params.sortOrder || "desc";

      // Get all products and apply filters (aligned with backend FilterProductsDto)
      let allMatching = await getMockProducts(params.search || "");

      if (params.categoryId) {
        allMatching = allMatching.filter(
          (p) => p.categoryId === params.categoryId
        );
      }
      if (params.minPrice != null) {
        const min = params.minPrice;
        allMatching = allMatching.filter((p) => {
          const price = p.minPrice ?? p.price;
          return price >= min;
        });
      }
      if (params.maxPrice != null) {
        const max = params.maxPrice;
        allMatching = allMatching.filter((p) => {
          const price = p.maxPrice ?? p.price;
          return price <= max;
        });
      }
      if (params.inStockOnly) {
        allMatching = allMatching.filter((p) => {
          const stock = p.stock ?? p.effectiveStock ?? 0;
          return stock > 0;
        });
      }
      if (params.promotionId) {
        allMatching = allMatching.filter((p) => getDiscountInfo(p).hasDiscount);
      }

      // Sort (mock has no createdAt, use name as fallback)
      allMatching = [...allMatching].sort((a, b) => {
        let cmp = 0;
        if (sortBy === "price") {
          const pa = a.minPrice ?? a.price;
          const pb = b.minPrice ?? b.price;
          cmp = pa - pb;
        } else if (sortBy === "name") {
          cmp = a.name.localeCompare(b.name);
        } else {
          cmp = (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
        }
        return sortOrder === "desc" ? -cmp : cmp;
      });

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

    return extractPaginatedData(response);
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (USE_MOCKS) {
      const product = await getMockProductBySlug(slug);
      if (!product) return null;
      return product;
    }

    const response = await apiClient.get<BackendResponse<Product>>(
      `/products/${slug}`
    );
    return extractResponseData(response);
  },

  /**
   * Get a product by ID or slug
   * Backend accepts both ID and slug
   */
  async getProductById(id: string): Promise<Product | null> {
    if (USE_MOCKS) {
      // Try to find by ID first, then by slug
      const allProducts = await getMockProducts("");
      const product = allProducts.find(p => p.id === id || p.slug === id);
      if (!product) return null;
      return product;
    }

    const response = await apiClient.get<BackendResponse<Product>>(
      `/products/${id}`
    );
    return extractResponseData(response);
  },

  async getFeaturedProducts(): Promise<Product[]> {
    if (USE_MOCKS) {
      return getMockFeaturedProducts();
    }

    const response = await apiClient.get<BackendResponse<Product[]>>(
      "/products/featured"
    );
    return extractResponseData(response);
  },

  async getLatestProducts(): Promise<Product[]> {
    if (USE_MOCKS) {
      // For now using featured as latest in mocks
      return getMockFeaturedProducts(8);
    }

    const response = await apiClient.get<BackendResponse<Product[]>>(
      "/products/latest"
    );
    return extractResponseData(response);
  },

  /**
   * Create a new product
   * Admin-only endpoint
   */
  async createProduct(data: {
    name: string;
    description: string;
    currency?: string;
    isOnSale?: boolean;
    discountType?: "PERCENTAGE" | "FIXED_AMOUNT" | null;
    discountValue?: number | null;
    saleStartsAt?: string | null;
    saleEndsAt?: string | null;
    categoryId: string;
    isActive?: boolean;
    isFeatured?: boolean;
    variants: Array<{
      sku: string;
      price: number;
      stock: number;
      image?: string;
      images?: string[];
      options?: Record<string, string>;
    }>;
  }): Promise<Product> {
    const response = await apiClient.post<BackendResponse<Product>>(
      "/products",
      data
    );
    return extractResponseData(response);
  },

  /**
   * Update a product by ID
   * Admin-only endpoint
   */
  async updateProduct(
    id: string,
    data: {
      name?: string;
      description?: string;
      currency?: string;
      isOnSale?: boolean;
      discountType?: "PERCENTAGE" | "FIXED_AMOUNT" | null;
      discountValue?: number | null;
      saleStartsAt?: string | null;
      saleEndsAt?: string | null;
      categoryId?: string;
      isActive?: boolean;
      isFeatured?: boolean;
      defaultVariantId?: string | null;
      variants?: Array<{
        id?: string;
        sku?: string;
        price?: number;
        stock?: number;
        image?: string;
        images?: string[];
        options?: Record<string, string>;
      }>;
    }
  ): Promise<Product> {
    const response = await apiClient.put<BackendResponse<Product>>(
      `/products/${id}`,
      data
    );
    return extractResponseData(response);
  },

  /**
   * Delete a product by ID
   * Admin-only endpoint
   */
  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },
};
