import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { couponsApi, type CouponsQueryParams, type CreateCouponData, type UpdateCouponData } from "./api";
import type { CouponsResult, Coupon } from "./api";
import { couponKeys } from "./query-keys";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/api/error-handler";

export function useCouponsQuery(params: CouponsQueryParams = {}, options?: { enabled?: boolean }) {
  return useQuery<CouponsResult>({
    queryKey: couponKeys.list(params),
    queryFn: () => couponsApi.getCoupons(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000, // 30 seconds
    enabled: options?.enabled !== false,
  });
}

/**
 * Get a coupon by ID (for admin edit page)
 */
export function useCouponByIdQuery(id: string) {
  return useQuery<Coupon | null>({
    queryKey: couponKeys.detail(id),
    queryFn: () => couponsApi.getCouponById(id),
    enabled: !!id,
    staleTime: 60_000, // Coupon details change less frequently
  });
}

/**
 * Mutation hook for creating a new coupon
 * Admin-only endpoint
 */
export function useCreateCouponMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCouponData) => couponsApi.createCoupon(data),
    onSuccess: () => {
      // Invalidate and refetch coupon queries
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
      toast.success("Coupon created successfully!");
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, "Failed to create coupon. Please check all fields and try again."), {
        duration: 5000,
      });
    },
  });
}

/**
 * Mutation hook for updating a coupon
 * Admin-only endpoint
 */
export function useUpdateCouponMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCouponData }) =>
      couponsApi.updateCoupon(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch coupon queries
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
      queryClient.invalidateQueries({
        queryKey: couponKeys.detail(variables.id),
      });
      toast.success("Coupon updated successfully!");
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, "Failed to update coupon. Please check all fields and try again."), {
        duration: 5000,
      });
    },
  });
}

/**
 * Mutation hook for deleting a coupon
 * Admin-only endpoint
 */
export function useDeleteCouponMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => couponsApi.deleteCoupon(id),
    onSuccess: () => {
      // Invalidate and refetch coupon queries
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
      toast.success("Coupon deleted successfully!");
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, "Failed to delete coupon. Please try again."));
    },
  });
}
