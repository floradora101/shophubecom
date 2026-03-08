import { apiGet, apiPut, apiPost } from "@/lib/api/request";
import type { User } from "@/features/auth/types";

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
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
    const data = await apiGet<User>("/users/profile");
    return { success: true, data };
  },

  async updateProfile(data: UpdateProfileData): Promise<ProfileResponse> {
    const user = await apiPut<User>("/users/profile", data);
    return { success: true, data: user };
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    return apiPost<{ success: boolean; message: string }>(
      "/users/change-password",
      data
    );
  },
};

