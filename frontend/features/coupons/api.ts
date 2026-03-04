import { apiClient } from "@/lib/api/client";
import type { BackendResponse } from "@/lib/types/api";
import { extractResponseData, extractPaginatedData } from "@/lib/api/response-transformer";

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minOrderTotal: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  usageLimit: number | null;
  perUserLimit: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponsQueryParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CouponsResult {
  data: Coupon[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCouponData {
  code: string;
  description: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minOrderTotal?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  isActive?: boolean;
}

export interface UpdateCouponData extends Partial<CreateCouponData> {}

export const couponsApi = {
  async getCoupons(params: CouponsQueryParams = {}): Promise<CouponsResult> {
    const response = await apiClient.get<BackendResponse<CouponsResult>>(
      "/coupons",
      { params }
    );
    return extractPaginatedData(response);
  },

  async getCouponById(id: string): Promise<Coupon> {
    const response = await apiClient.get<BackendResponse<Coupon>>(
      `/coupons/${id}`
    );
    return extractResponseData(response);
  },

  /**
   * Create a new coupon
   * Admin-only endpoint
   */
  async createCoupon(data: CreateCouponData): Promise<Coupon> {
    const response = await apiClient.post<BackendResponse<Coupon>>(
      "/coupons",
      data
    );
    return extractResponseData(response);
  },

  /**
   * Update a coupon by ID
   * Admin-only endpoint
   */
  async updateCoupon(
    id: string,
    data: UpdateCouponData
  ): Promise<Coupon> {
    const response = await apiClient.put<BackendResponse<Coupon>>(
      `/coupons/${id}`,
      data
    );
    return extractResponseData(response);
  },

  /**
   * Delete a coupon by ID
   * Admin-only endpoint
   */
  async deleteCoupon(id: string): Promise<void> {
    await apiClient.delete(`/coupons/${id}`);
  },

  /**
   * Validate a coupon for checkout.
   * Public endpoint - validates code against cart subtotal.
   * Returns discount amount if valid.
   * @param guestEmail - Optional. For guest checkout, pass email to enforce perUserLimit.
   */
  async validateCoupon(
    code: string,
    subtotal: number,
    guestEmail?: string
  ): Promise<{
    valid: boolean;
    discount: number;
    couponId?: string;
    code?: string;
    type?: "PERCENTAGE" | "FIXED_AMOUNT";
    message?: string;
  }> {
    const response = await apiClient.post<
      BackendResponse<{
        valid: boolean;
        discount: number;
        couponId?: string;
        code?: string;
        type?: "PERCENTAGE" | "FIXED_AMOUNT";
        message?: string;
      }>
    >("/coupons/validate", { code, subtotal, ...(guestEmail && { guestEmail }) });
    return extractResponseData(response);
  },
};
