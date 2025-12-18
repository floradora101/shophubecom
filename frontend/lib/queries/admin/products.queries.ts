import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  adminProductsApi,
  type CreateProductPayload,
  type UpdateProductPayload,
} from "@/lib/api/admin-products";
import type { AdminProduct } from "@/lib/types/admin.types";
import { productKeys } from "@/lib/queries/products";
import { adminQueryKeys } from "@/lib/queries/admin/queryKeys";

// ============================================================================
// Product Types
// ============================================================================

export type ProductsListParams = {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "price" | "createdAt";
  sortOrder?: "asc" | "desc";
};

export type ProductsListResult = {
  data: AdminProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ============================================================================
// Product Queries
// ============================================================================

/**
 * Get paginated products with filters, sorting, and pagination
 * Use this for the admin products listing page
 */
export function useAdminProductsQuery(params?: ProductsListParams) {
  return useQuery<ProductsListResult>({
    queryKey: adminQueryKeys.products.list(params),
    queryFn: () => adminProductsApi.getProducts(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/**
 * Get a single product by ID
 */
export function useAdminProductQuery(id: string, enabled = true) {
  return useQuery<AdminProduct | null>({
    queryKey: adminQueryKeys.products.detail(id),
    queryFn: async () => {
      const product = await adminProductsApi.getProduct(id);
      return product;
    },
    enabled: enabled && !!id,
    staleTime: 30_000,
  });
}

/**
 * Get ALL products (no pagination) - for dropdowns, promotions, etc.
 * This is cached separately from the paginated list
 */
export function useAdminAllProductsQuery() {
  return useQuery<AdminProduct[]>({
    queryKey: adminQueryKeys.products.allProducts(),
    queryFn: async () => {
      // Fetch all products with a large limit
      const result = await adminProductsApi.getProducts({
        page: 1,
        limit: 200,
      });
      return result.data;
    },
    staleTime: 60_000, // 1 minute
  });
}

// ============================================================================
// Product Mutations
// ============================================================================

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductPayload) =>
      adminProductsApi.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProductPayload;
    }) => adminProductsApi.updateProduct(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.products.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.products.lists(),
      });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminProductsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
