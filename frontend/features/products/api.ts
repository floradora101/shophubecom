import {
  apiGet,
  apiGetWithParams,
  apiPost,
  apiPut,
  apiDelete,
  ApiRequestError,
} from "@/lib/api/request";
import type { Product, ProductFilters } from "./types";
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

    return apiGetWithParams<ProductsResult>("/products", params);
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (USE_MOCKS) {
      const product = await getMockProductBySlug(slug);
      if (!product) return null;
      return product;
    }

    return apiGet<Product>(`/products/${slug}`);
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

    try {
      return await apiGet<Product>(`/products/${id}`);
    } catch (err) {
      if (err instanceof ApiRequestError && err.isNotFound) return null;
      throw err;
    }
  },

  async getFeaturedProducts(): Promise<Product[]> {
    if (USE_MOCKS) {
      return getMockFeaturedProducts();
    }

    return apiGet<Product[]>("/products/featured");
  },

  async getLatestProducts(): Promise<Product[]> {
    if (USE_MOCKS) {
      // For now using featured as latest in mocks
      return getMockFeaturedProducts(8);
    }

    return apiGet<Product[]>("/products/latest");
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
    return apiPost<Product>("/products", data);
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
    return apiPut<Product>(`/products/${id}`, data);
  },

  /**
   * Delete a product by ID
   * Admin-only endpoint
   */
  async deleteProduct(id: string): Promise<void> {
    await apiDelete<void>(`/products/${id}`);
  },
};
