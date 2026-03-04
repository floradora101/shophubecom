import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { departmentsApi } from "./api";
import { departmentKeys } from "./query-keys";
import type { Department } from "./types";

export function useDepartmentsQuery(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: "name" | "createdAt";
  sortOrder?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: departmentKeys.list(params),
    queryFn: () => departmentsApi.getDepartments(params),
    staleTime: 30_000,
  });
}

export function useDepartmentQuery(id: string) {
  return useQuery<Department>({
    queryKey: departmentKeys.detail(id),
    queryFn: () => departmentsApi.getDepartment(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateDepartmentMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: {
      name: string;
      parentCategoryId: string;
      highlightedSubCategoryIds: string[];
      isActive: boolean;
    }) => departmentsApi.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
      toast.success("Subcategory spotlight created successfully!");
      router.push("/admin/subcategories");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create. Please try again.";
      toast.error(errorMessage);
    },
  });
}

export function useUpdateDepartmentMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        name: string;
        parentCategoryId: string;
        highlightedSubCategoryIds: string[];
        isActive: boolean;
      }>;
    }) => departmentsApi.updateDepartment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
      queryClient.invalidateQueries({
        queryKey: departmentKeys.detail(variables.id),
      });
      toast.success("Subcategory spotlight updated successfully!");
      router.push("/admin/subcategories");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update. Please try again.";
      toast.error(errorMessage);
    },
  });
}

export function useDeleteDepartmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => departmentsApi.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
      toast.success("Subcategory spotlight deleted successfully!");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete. Please try again.";
      toast.error(errorMessage);
    },
  });
}

