import { apiClient } from "@/lib/api/client";
import type { BackendResponse } from "@/lib/types/api";
import { extractResponseData } from "@/lib/api/response-transformer";

export interface Promotion {
  id: string;
  name: string;
  description?: string | null;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  startsAt?: string | Date | null;
  expiresAt?: string | Date | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productIds?: string[];
  categoryIds?: string[];
  heroSlideId?: string | null;
  heroImageUrl?: string | null;
}

export interface CreatePromotionData {
  name: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive?: boolean;
  productIds?: string[];
  categoryIds?: string[];
  /** Optional hero slide image URL; headline/description come from promotion name/description */
  heroImageUrl?: string | null;
}

export interface UpdatePromotionData extends Partial<CreatePromotionData> {}

export const promotionsApi = {
  /**
   * Get all promotions (for admin and hero slide picker)
   */
  async getPromotions(): Promise<Promotion[]> {
    const response = await apiClient.get<BackendResponse<Promotion[]>>(
      "/promotions"
    );
    return extractResponseData(response);
  },

  /**
   * Get a single promotion by ID
   */
  async getPromotionById(id: string): Promise<Promotion> {
    const response = await apiClient.get<BackendResponse<Promotion>>(
      `/promotions/${id}`
    );
    return extractResponseData(response);
  },

  /**
   * Create a new promotion (admin only)
   */
  async createPromotion(data: CreatePromotionData): Promise<Promotion> {
    const response = await apiClient.post<BackendResponse<Promotion>>(
      "/promotions",
      data
    );
    return extractResponseData(response);
  },

  /**
   * Update an existing promotion (admin only)
   */
  async updatePromotion(
    id: string,
    data: UpdatePromotionData
  ): Promise<Promotion> {
    const response = await apiClient.put<BackendResponse<Promotion>>(
      `/promotions/${id}`,
      data
    );
    return extractResponseData(response);
  },

  /**
   * Delete a promotion (admin only)
   */
  async deletePromotion(id: string): Promise<void> {
    await apiClient.delete(`/promotions/${id}`);
  },
};
