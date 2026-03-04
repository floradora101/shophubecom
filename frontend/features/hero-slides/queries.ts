import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { heroSlidesApi, type HeroSlideFilters, type HeroSlidesResponse } from "./api";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import { heroSlideKeys } from "./query-keys";
import { toast } from "sonner";

export function useHeroSlidesQuery(filters?: HeroSlideFilters) {
  return useQuery<HeroSlidesResponse>({
    queryKey: heroSlideKeys.list(filters),
    queryFn: () => heroSlidesApi.getHeroSlides(filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000, // 30 seconds
  });
}

export function useHeroSlideQuery(id: string) {
  return useQuery<HeroSlide | null>({
    queryKey: heroSlideKeys.detail(id),
    queryFn: () => heroSlidesApi.getHeroSlideById(id),
    enabled: !!id,
    staleTime: 60_000, // 1 minute
  });
}

export function useActiveHeroSlidesQuery() {
  return useQuery<HeroSlide[]>({
    queryKey: heroSlideKeys.active(),
    queryFn: () => heroSlidesApi.getActiveSlides(),
    staleTime: 30_000, // 30 seconds
  });
}

export function useCreateHeroSlideMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => heroSlidesApi.createHeroSlide(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: heroSlideKeys.all });
      toast.success("Hero slide created successfully!");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create hero slide. Please try again.";
      toast.error(errorMessage);
    },
  });
}

export function useUpdateHeroSlideMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      heroSlidesApi.updateHeroSlide(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: heroSlideKeys.all });
      queryClient.invalidateQueries({
        queryKey: heroSlideKeys.detail(variables.id),
      });
      toast.success("Hero slide updated successfully!");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update hero slide. Please try again.";
      toast.error(errorMessage);
    },
  });
}

export function useDeleteHeroSlideMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => heroSlidesApi.deleteHeroSlide(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: heroSlideKeys.all });
      toast.success("Hero slide deleted successfully!");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete hero slide. Please try again.";
      toast.error(errorMessage);
    },
  });
}
