import {
  apiGet,
  apiGetWithParams,
  apiPost,
  apiPut,
  apiDelete,
  ApiRequestError,
} from "@/lib/api/request";
import { USE_MOCKS } from "@/lib/flags";

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

export type UpdateCouponData = Partial<CreateCouponData>;

async function getMockCouponModels(): Promise<Coupon[]> {
  const { getAllCoupons } = await import("@/lib/mock-data/mock-data");

  return getAllCoupons().map((coupon) => ({
    id: coupon.id,
    code: coupon.code,
    description: coupon.description ?? null,
    type: coupon.type,
    value: coupon.value,
    minOrderTotal: coupon.minOrderTotal ?? null,
    startsAt: coupon.startsAt ?? null,
    expiresAt: coupon.expiresAt ?? null,
    usageLimit: coupon.usageLimit ?? null,
    perUserLimit: 1,
    usedCount: coupon.usedCount ?? 0,
    isActive: coupon.isActive,
    createdAt: coupon.createdAt,
    updatedAt: coupon.createdAt,
  }));
}

export const couponsApi = {
  async getCoupons(params: CouponsQueryParams = {}): Promise<CouponsResult> {
    if (USE_MOCKS) {
      const page = params.page ?? 1;
      const limit = params.limit ?? 10;
      const normalizedSearch = params.search?.trim().toLowerCase();

      let coupons = await getMockCouponModels();

      if (normalizedSearch) {
        coupons = coupons.filter(
          (coupon) =>
            coupon.code.toLowerCase().includes(normalizedSearch) ||
            (coupon.description?.toLowerCase().includes(normalizedSearch) ?? false)
        );
      }

      if (params.isActive !== undefined) {
        coupons = coupons.filter((coupon) => coupon.isActive === params.isActive);
      }

      coupons.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const start = (page - 1) * limit;
      const data = coupons.slice(start, start + limit);

      return {
        data,
        total: coupons.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(coupons.length / limit)),
      };
    }

    return apiGetWithParams<CouponsResult>("/coupons", params);
  },

  async getCouponById(id: string): Promise<Coupon> {
    if (USE_MOCKS) {
      const coupon = (await getMockCouponModels()).find((item) => item.id === id);

      if (!coupon) {
        throw new ApiRequestError({
          status: 404,
          code: "COUPON_NOT_FOUND",
          message: `Coupon "${id}" was not found in mock mode.`,
          isNetworkError: false,
          isAuthError: false,
          isForbiddenError: false,
          isNotFoundError: true,
          isServerError: false,
          isAdminError: false,
        });
      }

      return coupon;
    }

    return apiGet<Coupon>(`/coupons/${id}`);
  },

  /**
   * Create a new coupon
   * Admin-only endpoint
   */
  async createCoupon(data: CreateCouponData): Promise<Coupon> {
    if (USE_MOCKS) {
      throw new Error("Coupon creation is not supported when NEXT_PUBLIC_USE_MOCKS=true.");
    }
    return apiPost<Coupon>("/coupons", data);
  },

  /**
   * Update a coupon by ID
   * Admin-only endpoint
   */
  async updateCoupon(
    id: string,
    data: UpdateCouponData
  ): Promise<Coupon> {
    if (USE_MOCKS) {
      throw new Error("Coupon updates are not supported when NEXT_PUBLIC_USE_MOCKS=true.");
    }
    return apiPut<Coupon>(`/coupons/${id}`, data);
  },

  /**
   * Delete a coupon by ID
   * Admin-only endpoint
   */
  async deleteCoupon(id: string): Promise<void> {
    if (USE_MOCKS) {
      throw new Error("Coupon deletion is not supported when NEXT_PUBLIC_USE_MOCKS=true.");
    }
    await apiDelete<void>(`/coupons/${id}`);
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
    if (USE_MOCKS) {
      const coupons = await getMockCouponModels();
      const normalizedCode = code.trim().toUpperCase();
      const now = Date.now();
      const coupon = coupons.find(
        (item) => item.code.toUpperCase() === normalizedCode
      );

      if (!coupon) {
        return { valid: false, discount: 0, message: "Invalid coupon code" };
      }

      if (!coupon.isActive) {
        return {
          valid: false,
          discount: 0,
          code: coupon.code,
          message: "This coupon is not active",
        };
      }

      if (coupon.startsAt && new Date(coupon.startsAt).getTime() > now) {
        return {
          valid: false,
          discount: 0,
          code: coupon.code,
          message: "This coupon is not active yet",
        };
      }

      if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < now) {
        return {
          valid: false,
          discount: 0,
          code: coupon.code,
          message: "This coupon has expired",
        };
      }

      if (coupon.minOrderTotal && subtotal < coupon.minOrderTotal) {
        return {
          valid: false,
          discount: 0,
          code: coupon.code,
          message: `Minimum order total is $${coupon.minOrderTotal.toFixed(2)}`,
        };
      }

      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return {
          valid: false,
          discount: 0,
          code: coupon.code,
          message: "This coupon has reached its usage limit",
        };
      }

      const discount =
        coupon.type === "PERCENTAGE"
          ? Number(((subtotal * coupon.value) / 100).toFixed(2))
          : Math.min(subtotal, coupon.value);

      return {
        valid: discount > 0,
        discount,
        couponId: coupon.id,
        code: coupon.code,
        type: coupon.type,
        message: discount > 0 ? undefined : "This coupon does not apply to the current cart",
      };
    }

    return apiPost("/coupons/validate", {
      code,
      subtotal,
      ...(guestEmail && { guestEmail }),
    });
  },
};
