import { apiClient } from "@/lib/api/client";
import type { BackendResponse } from "@/lib/types/api";
import type { Announcement } from "@/lib/types/announcements.types";
import {
  extractPaginatedData,
  extractResponseData,
} from "@/lib/api/response-transformer";

export interface AnnouncementFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "priority" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface AnnouncementsResponse {
  data: Announcement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Transform backend response to frontend Announcement type
function transformBackendAnnouncement(backendAnnouncement: any): Announcement {
  return {
    id: backendAnnouncement.id,
    text: backendAnnouncement.text,
    highlight: backendAnnouncement.highlight,
    icon: backendAnnouncement.icon,
    isActive: backendAnnouncement.isActive,
    priority: backendAnnouncement.priority,
    createdAt: backendAnnouncement.createdAt
      ? new Date(backendAnnouncement.createdAt).toISOString()
      : new Date().toISOString(),
    updatedAt: backendAnnouncement.updatedAt
      ? new Date(backendAnnouncement.updatedAt).toISOString()
      : new Date().toISOString(),
  };
}

export const announcementsApi = {
  /**
   * Get active announcements (public endpoint)
   * Returns only active announcements sorted by priority
   */
  async getActiveAnnouncements(): Promise<Announcement[]> {
    const response = await apiClient.get<BackendResponse<any[]>>(
      "/announcements/active"
    );
    const announcements = extractResponseData(response);
    return announcements.map(transformBackendAnnouncement);
  },

  /**
   * Get all announcements with filtering and pagination (admin)
   */
  async getAnnouncements(
    filters?: AnnouncementFilters
  ): Promise<AnnouncementsResponse> {
    const response = await apiClient.get<
      BackendResponse<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>
    >("/announcements", { params: filters });

    const result = extractPaginatedData(response);
    return {
      ...result,
      data: result.data.map(transformBackendAnnouncement),
    };
  },

  /**
   * Get a single announcement by ID (admin)
   */
  async getAnnouncementById(id: string): Promise<Announcement> {
    const response = await apiClient.get<BackendResponse<any>>(
      `/announcements/${id}`
    );
    const announcement = extractResponseData(response);
    return transformBackendAnnouncement(announcement);
  },

  /**
   * Create a new announcement (admin)
   */
  async createAnnouncement(data: any): Promise<Announcement> {
    const response = await apiClient.post<BackendResponse<any>>(
      "/announcements",
      data
    );
    const announcement = extractResponseData(response);
    return transformBackendAnnouncement(announcement);
  },

  /**
   * Update an announcement (admin)
   */
  async updateAnnouncement(id: string, data: any): Promise<Announcement> {
    const response = await apiClient.put<BackendResponse<any>>(
      `/announcements/${id}`,
      data
    );
    const announcement = extractResponseData(response);
    return transformBackendAnnouncement(announcement);
  },

  /**
   * Delete an announcement (admin)
   */
  async deleteAnnouncement(id: string): Promise<void> {
    await apiClient.delete(`/announcements/${id}`);
  },
};
