import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { announcementsApi, type AnnouncementFilters, type AnnouncementsResponse } from "./api";
import type { Announcement, CreateAnnouncementInput } from "@/lib/types/announcements.types";
import { announcementKeys } from "./query-keys";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/api/error-handler";

export function useAnnouncementsQuery(filters?: AnnouncementFilters) {
  return useQuery<AnnouncementsResponse>({
    queryKey: announcementKeys.list(filters),
    queryFn: () => announcementsApi.getAnnouncements(filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000, // 30 seconds
  });
}

export function useAnnouncementQuery(id: string) {
  return useQuery<Announcement | null>({
    queryKey: announcementKeys.detail(id),
    queryFn: () => announcementsApi.getAnnouncementById(id),
    enabled: !!id,
    staleTime: 60_000, // 1 minute
  });
}

export function useActiveAnnouncementsQuery(options?: { enabled?: boolean }) {
  return useQuery<Announcement[]>({
    queryKey: announcementKeys.active(),
    queryFn: () => announcementsApi.getActiveAnnouncements(),
    enabled: options?.enabled !== false,
    staleTime: 30_000, // 30 seconds
  });
}

export function useCreateAnnouncementMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnnouncementInput) => announcementsApi.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
      toast.success("Announcement created successfully!");
    },
    onError: (error: unknown) => {
      toast.error(
        extractErrorMessage(
          error,
          "Failed to create announcement. Please try again."
        )
      );
    },
  });
}

export function useUpdateAnnouncementMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAnnouncementInput> }) =>
      announcementsApi.updateAnnouncement(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
      queryClient.invalidateQueries({
        queryKey: announcementKeys.detail(variables.id),
      });
      toast.success("Announcement updated successfully!");
    },
    onError: (error: unknown) => {
      toast.error(
        extractErrorMessage(
          error,
          "Failed to update announcement. Please try again."
        )
      );
    },
  });
}

export function useDeleteAnnouncementMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => announcementsApi.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
      toast.success("Announcement deleted successfully!");
    },
    onError: (error: unknown) => {
      toast.error(
        extractErrorMessage(
          error,
          "Failed to delete announcement. Please try again."
        )
      );
    },
  });
}
