import { apiClient } from "@/lib/api/client";
import type { User } from "@/features/auth/types";

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileResponse {
  success: boolean;
  data: User;
}

export const profileApi = {
  async getProfile(): Promise<ProfileResponse> {
    const response = await apiClient.get<ProfileResponse>("/users/profile");
    return response.data;
  },

  async updateProfile(data: UpdateProfileData): Promise<ProfileResponse> {
    const response = await apiClient.put<ProfileResponse>(
      "/users/profile",
      data
    );
    return response.data;
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
    }>("/users/change-password", data);
    return response.data;
  },
};

