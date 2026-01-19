/**
 * useCheckoutCoupon Hook
 *
 * Manages coupon code validation and discount calculation.
 *
 * Responsibilities:
 * - Coupon code state
 * - Coupon validation
 * - Discount calculation
 * - Error handling
 */

import { useState, useCallback } from "react";
import { toast } from "sonner";

interface UseCheckoutCouponReturn {
  couponCode: string;
  couponDiscount: number;
  couponError: string;
  isValidatingCoupon: boolean;
  handleApplyCoupon: (code: string) => Promise<void>;
  handleRemoveCoupon: () => void;
}

/**
 * Hook for managing checkout coupon functionality
 */
export function useCheckoutCoupon(): UseCheckoutCouponReturn {
  // Coupon state management
  const [couponCode, setCouponCode] = useState<string>("");
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string>("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState<boolean>(false);

  const handleApplyCoupon = useCallback(async (code: string) => {
    setIsValidatingCoupon(true);
    setCouponError("");

    try {
      // Mock coupon validation - in production this would be an API call

      // Simple mock logic - accept "SAVE10", "DISCOUNT20", or "WELCOME15"
      const validCoupons: Record<string, number> = {
        SAVE10: 10,
        DISCOUNT20: 20,
        WELCOME15: 15,
      };

      if (validCoupons[code]) {
        setCouponCode(code);
        setCouponDiscount(validCoupons[code]);
        toast.success(
          `Coupon "${code}" applied! You saved $${validCoupons[code].toFixed(2)}`
        );
      } else {
        throw new Error("Invalid coupon code");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to apply coupon";
      setCouponError(message);
      toast.error(message);
    } finally {
      setIsValidatingCoupon(false);
    }
  }, []);

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
