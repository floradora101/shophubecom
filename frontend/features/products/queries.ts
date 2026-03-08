import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi, type ProductsQueryParams } from "./api";
import type { ProductsResult, Product } from "./api";
import { normalizeFilters } from "./utils/filters";
import { productKeys } from "./query-keys";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/api/error-handler";

export function useProductsQuery(params: ProductsQueryParams) {
  // Normalize filters before using in query key and API call
  // This ensures consistent cache keys and proper type conversion
  const normalizedParams = normalizeFilters(params);

  // Longer stale time for filtered results (less likely to change frequently)
  // Filtered queries (category, search, price, inStockOnly) can be cached longer since they're more specific
  const hasFilters =
    normalizedParams.categoryId ||
    normalizedParams.search ||
    normalizedParams.minPrice !== undefined ||
    normalizedParams.maxPrice !== undefined ||
    normalizedParams.inStockOnly !== undefined;
  const staleTime = hasFilters ? 60_000 : 30_000; // 1 minute for filtered, 30s for all products

  return useQuery<ProductsResult>({
    queryKey: productKeys.list(normalizedParams),
    queryFn: () => productsApi.getProducts(normalizedParams),
    placeholderData: keepPreviousData,
    staleTime,
  });
}

export function useProductQuery(slug: string, options?: { enabled?: boolean }) {
  return useQuery<Product | null>({
    queryKey: productKeys.detail(slug),
    queryFn: () => productsApi.getProductBySlug(slug),
    enabled: !!slug && options?.enabled !== false,
    staleTime: 60_000, // Product details change less frequently
  });
}

/**
 * Get a product by ID (for admin edit page)
 * Backend accepts both ID and slug
 */
export function useProductByIdQuery(id: string) {
  return useQuery<Product | null>({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getProductById(id),
    enabled: !!id,
    staleTime: 60_000, // Product details change less frequently
  });
}

export function useFeaturedProductsQuery() {
  return useQuery<Product[]>({
    queryKey: productKeys.featured(),
    queryFn: () => productsApi.getFeaturedProducts(),
    staleTime: 30_000, // 30 seconds
  });
}

export function useLatestProductsQuery() {
  return useQuery<Product[]>({
    queryKey: productKeys.latest(),
    queryFn: () => productsApi.getLatestProducts(),
    staleTime: 30_000, // 30 seconds
  });
}

/**
 * Mutation hook for creating a new product
 * Admin-only endpoint
 */
export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
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
    }) => productsApi.createProduct(data),
    onSuccess: () => {
      // Invalidate and refetch product queries
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Product created successfully!");
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, "Failed to create product. Please check all fields and try again."), {
        duration: 5000,
      });
    },
  });
}

/**
 * Mutation hook for updating a product
 * Admin-only endpoint
 */
export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
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
      };
    }) => productsApi.updateProduct(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch product queries
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.id),
      });
      toast.success("Product updated successfully!");
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, "Failed to update product. Please check all fields and try again."), {
        duration: 5000,
      });
    },
  });
}

/**
 * Mutation hook for deleting a product
 * Admin-only endpoint
 */
export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => {
      // Invalidate and refetch product queries
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Product deleted successfully!");
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, "Failed to delete product. Please try again."));
    },
  });
}
