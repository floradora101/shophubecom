import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi, type UpdateProfileData } from "./api";
import { toast } from "sonner";

export const profileKeys = {
  all: ["profile"] as const,
  detail: () => [...profileKeys.all, "detail"] as const,
};

export function useProfileQuery() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: () => profileApi.getProfile(),
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => profileApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      profileApi.changePassword(data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Password changed successfully");
      } else {
        toast.error(data.message || "Failed to change password");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to change password");
    },
  });
}
