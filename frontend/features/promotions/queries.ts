"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { promotionsApi, type CreatePromotionData, type UpdatePromotionData } from "./api";
import { promotionKeys } from "./query-keys";
import { toast } from "sonner";

export function usePromotionsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: promotionKeys.lists(),
    queryFn: () => promotionsApi.getPromotions(),
    staleTime: 30_000,
    enabled: options?.enabled !== false,
  });
}

export function usePromotionQuery(id: string) {
  return useQuery({
    queryKey: promotionKeys.detail(id),
    queryFn: () => promotionsApi.getPromotionById(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCreatePromotionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePromotionData) => promotionsApi.createPromotion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.all });
      toast.success("Promotion created successfully!");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create promotion. Please try again.";
      toast.error(errorMessage);
    },
  });
}

export function useUpdatePromotionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePromotionData }) =>
      promotionsApi.updatePromotion(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.all });
      queryClient.invalidateQueries({
        queryKey: promotionKeys.detail(variables.id),
      });
      toast.success("Promotion updated successfully!");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update promotion. Please try again.";
      toast.error(errorMessage);
    },
  });
}

export function useDeletePromotionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => promotionsApi.deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.all });
      toast.success("Promotion deleted successfully!");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete promotion. Please try again.";
      toast.error(errorMessage);
    },
  });
}
