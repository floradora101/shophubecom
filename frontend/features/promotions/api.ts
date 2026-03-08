import {
  apiGet,
  apiGetWithParams,
  apiPost,
  apiPut,
  apiDelete,
} from "@/lib/api/request";

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
   * Get all promotions (for admin and hero slide picker).
   * Backend returns paginated response; we extract the data array.
   */
  async getPromotions(params?: { page?: number; limit?: number }): Promise<Promotion[]> {
    const result = await apiGetWithParams<
      { data: Promotion[]; total: number; page: number; limit: number; totalPages: number }
    >("/promotions", params);
    return result.data;
  },

  /**
   * Get a single promotion by ID
   */
  async getPromotionById(id: string): Promise<Promotion> {
    return apiGet<Promotion>(`/promotions/${id}`);
  },

  /**
   * Create a new promotion (admin only)
   */
  async createPromotion(data: CreatePromotionData): Promise<Promotion> {
    return apiPost<Promotion>("/promotions", data);
  },

  /**
   * Update an existing promotion (admin only)
   */
  async updatePromotion(
    id: string,
    data: UpdatePromotionData
  ): Promise<Promotion> {
    return apiPut<Promotion>(`/promotions/${id}`, data);
  },

  /**
   * Delete a promotion (admin only)
   */
  async deletePromotion(id: string): Promise<void> {
    await apiDelete<void>(`/promotions/${id}`);
  },
};
