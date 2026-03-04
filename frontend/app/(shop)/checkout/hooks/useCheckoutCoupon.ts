/**
 * useCheckoutCoupon Hook
 *
 * Manages coupon code validation and discount calculation.
 * Uses backend API for production-ready validation.
 *
 * Responsibilities:
 * - Coupon code state
 * - Backend coupon validation (POST /api/coupons/validate)
 * - Discount calculation from server response
 * - Error handling
 */

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { couponsApi } from "@/features/coupons/api";
import { extractErrorInfo } from "@/lib/api/error-handler";

interface UseCheckoutCouponOptions {
  /** Cart subtotal - required for backend validation (minOrderTotal, discount calc) */
  subtotal: number;
  /** Guest email - when provided, enforces perUserLimit for guest checkout */
  guestEmail?: string;
}

interface UseCheckoutCouponReturn {
  couponCode: string;
  couponDiscount: number;
  couponError: string;
  isValidatingCoupon: boolean;
  handleApplyCoupon: (code: string) => Promise<void>;
  handleRemoveCoupon: () => void;
}

/**
 * Hook for managing checkout coupon functionality.
 * Validates coupons against backend; discount applies to cart total.
 */
export function useCheckoutCoupon({
  subtotal,
  guestEmail,
}: UseCheckoutCouponOptions): UseCheckoutCouponReturn {
  const [couponCode, setCouponCode] = useState<string>("");
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string>("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState<boolean>(false);

  const handleApplyCoupon = useCallback(
    async (code: string) => {
      const trimmed = code.trim().toUpperCase();
      if (!trimmed) return;

      setIsValidatingCoupon(true);
      setCouponError("");

      try {
        const result = await couponsApi.validateCoupon(
          trimmed,
          subtotal,
          guestEmail
        );

        if (result.valid && result.discount > 0) {
          setCouponCode(result.code ?? trimmed);
          setCouponDiscount(result.discount);
          toast.success(
            `Coupon "${result.code ?? trimmed}" applied! You save $${result.discount.toFixed(2)}`
          );
        } else {
          const message = result.message ?? "Invalid coupon code";
          setCouponError(message);
          toast.error(message);
        }
      } catch (error) {
        const errorInfo = extractErrorInfo(error);
        const message = errorInfo.message ?? "Failed to apply coupon";
        setCouponError(message);
        toast.error(message);
      } finally {
        setIsValidatingCoupon(false);
      }
    },
    [subtotal, guestEmail]
  );

  const handleRemoveCoupon = useCallback(() => {
    setCouponCode("");
    setCouponDiscount(0);
    setCouponError("");
    toast.success("Coupon removed");
  }, []);

  return {
    couponCode,
    couponDiscount,
    couponError,
    isValidatingCoupon,
    handleApplyCoupon,
    handleRemoveCoupon,
  };
}
