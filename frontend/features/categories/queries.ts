import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "./api";
import type { Category } from "@/features/products/types";
import { categoryKeys } from "./query-keys";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { extractErrorMessage } from "@/lib/api/error-handler";

/**
 * Get all categories (flat list) with pagination
 */
export function useCategoriesQuery(params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "createdAt";
  sortOrder?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoriesApi.getCategories(params),
    staleTime: 60_000, // 1 minute - categories don't change frequently
  });
}

/**
 * Get all categories as a hierarchical tree
 * Returns only root categories with children populated recursively
 */
export function useCategoriesTreeQuery(options?: { enabled?: boolean }) {
  return useQuery<Category[]>({
    queryKey: categoryKeys.tree(),
    queryFn: () => categoriesApi.getCategoriesTree(),
    enabled: options?.enabled !== false,
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Get a single category by ID or slug
 */
export function useCategoryQuery(
  idOrSlug: string,
  options?: { enabled?: boolean }
) {
  return useQuery<Category>({
    queryKey: categoryKeys.detail(idOrSlug),
    queryFn: () => categoriesApi.getCategoryByIdOrSlug(idOrSlug),
    enabled: !!idOrSlug && options?.enabled !== false,
    staleTime: 60_000,
  });
}

/**
 * Mutation hook for creating a new category
 */
export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string | null;
      parentId?: string | null;
    }) => categoriesApi.createCategory(data),
    onSuccess: () => {
      // Invalidate and refetch category queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Category created successfully!");
      router.push("/admin/categories");
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, "Failed to create category. Please try again."));
    },
  });
}

/**
 * Mutation hook for updating an existing category
 */
export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        description?: string | null;
        parentId?: string | null;
      };
    }) => categoriesApi.updateCategory(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch category queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(variables.id),
      });
      toast.success("Category updated successfully!");
      router.push("/admin/categories");
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, "Failed to update category. Please try again."));
    },
  });
}

/**
 * Mutation hook for deleting a category
 */
export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.deleteCategory(id),
    onSuccess: () => {
      // Invalidate and refetch category queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Category deleted successfully!");
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, "Failed to delete category. Please try again."));
    },
  });
}