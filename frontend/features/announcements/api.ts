import {
  apiGet,
  apiGetWithParams,
  apiPost,
  apiPut,
  apiDelete,
} from "@/lib/api/request";
import type { Announcement } from "@/lib/types/announcements.types";

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
    const announcements = await apiGet<any[]>("/announcements/active");
    return announcements.map(transformBackendAnnouncement);
  },

  /**
   * Get all announcements with filtering and pagination (admin)
   */
  async getAnnouncements(
    filters?: AnnouncementFilters
  ): Promise<AnnouncementsResponse> {
    const result = await apiGetWithParams<{
      data: any[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>("/announcements", filters);
    return {
      ...result,
      data: result.data.map(transformBackendAnnouncement),
    };
  },

  /**
   * Get a single announcement by ID (admin)
   */
  async getAnnouncementById(id: string): Promise<Announcement> {
    const announcement = await apiGet<any>(`/announcements/${id}`);
    return transformBackendAnnouncement(announcement);
  },

  /**
   * Create a new announcement (admin)
   */
  async createAnnouncement(data: any): Promise<Announcement> {
    const announcement = await apiPost<any>("/announcements", data);
    return transformBackendAnnouncement(announcement);
  },

  /**
   * Update an announcement (admin)
   */
  async updateAnnouncement(id: string, data: any): Promise<Announcement> {
    const announcement = await apiPut<any>(`/announcements/${id}`, data);
    return transformBackendAnnouncement(announcement);
  },

  /**
   * Delete an announcement (admin)
   */
  async deleteAnnouncement(id: string): Promise<void> {
    await apiDelete<void>(`/announcements/${id}`);
  },
};
