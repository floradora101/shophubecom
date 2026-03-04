import { DiscountType } from '@prisma/client';

/**
 * Response for coupon validation.
 * Returned by POST /api/coupons/validate.
 */
export class ValidateCouponResponseDto {
  valid!: boolean;
  discount!: number;
  couponId?: string;
  code?: string;
  type?: DiscountType;
  value?: number; // Coupon's configured value (for OrderCoupon record)
  message?: string;
}
