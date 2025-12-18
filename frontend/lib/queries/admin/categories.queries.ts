import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  adminCategoriesApi,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
} from "@/lib/api/admin-categories";
import type { Category } from "@/lib/types/product.types";
import { categoryKeys } from "@/lib/queries/categories";
import { adminQueryKeys } from "@/lib/queries/admin/queryKeys";

// ============================================================================
// Category Types
// ============================================================================

export type CategoriesListParams = {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "createdAt";
  sortOrder?: "asc" | "desc";
};

export type CategoriesListResult = {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ============================================================================
// Category Queries
// ============================================================================

/**
 * Get paginated categories with filters, sorting, and pagination
 * Use this for the admin categories listing page
 */
export function useAdminCategoriesQuery(params?: CategoriesListParams) {
  return useQuery<CategoriesListResult>({
    queryKey: adminQueryKeys.categories.list(params),
    queryFn: () => adminCategoriesApi.getCategories(params),
    placeholderData: keepPreviousData, // Keep previous data while fetching new page
    staleTime: 30_000, // 30 seconds - admin data changes more frequently
  });
}

/**
 * Get a single category by ID
 */
export function useAdminCategoryQuery(id: string, enabled = true) {
  return useQuery<Category | null>({
    queryKey: adminQueryKeys.categories.detail(id),
    queryFn: async () => {
      const category = await adminCategoriesApi.getCategory(id);
      return category;
    },
    enabled: enabled && !!id,
    staleTime: 30_000,
  });
}

/**
 * Get ALL categories (no pagination) - for dropdowns, parent lookup, etc.
 * This is cached separately from the paginated list to avoid conflicts
 * Use this in forms, dropdowns, and anywhere you need the full category list
 */
export function useAdminAllCategoriesQuery() {
  return useQuery<Category[]>({
    queryKey: adminQueryKeys.categories.allCategories(),
    queryFn: async () => {
      // Fetch all categories with a large limit
      const result = await adminCategoriesApi.getCategories({
        page: 1,
        limit: 200,
      });
      return result.data;
    },
    staleTime: 60_000, // 1 minute - all categories list changes less frequently
  });
}

// ============================================================================
// Category Mutations
// ============================================================================

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) =>
      adminCategoriesApi.createCategory(payload),
    onSuccess: () => {
      // Invalidate all category queries to refetch
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.categories.all,
      });
      // Also invalidate storefront categories
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCategoryPayload;
    }) => adminCategoriesApi.updateCategory(id, payload),
    onSuccess: (_, variables) => {
      // Invalidate specific category detail
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.categories.detail(variables.id),
      });
      // Invalidate all lists
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.categories.lists(),
      });
      // Also invalidate storefront categories
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminCategoriesApi.deleteCategory(id),
    onSuccess: () => {
      // Invalidate all category queries
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.categories.all,
      });
      // Also invalidate storefront categories
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}
