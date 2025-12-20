// Admin page for editing a promotion or coupon.
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { CouponForm } from "@/features/admin/components/coupons/CouponForm";
import { adminApi } from "@/dev/mocks/mockAdmin";
import { extractErrorMessage } from "@/lib/utils/error-handler";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Coupon } from "@/features/products/types";
import type { CouponFormData } from "@/features/admin/schemas/coupon";

export default function EditPromotionPage() {
  const router = useRouter();
  const params = useParams();
  const couponId = params.id as string;
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPromotion = async () => {
      try {
        const data = await adminApi.getCoupon(couponId);
        if (data) {
          setCoupon(data);
        } else {
          toast.error("Coupon not found");
          router.push("/admin/coupons");
        }
      } catch (error) {
        toast.error(extractErrorMessage(error, "Failed to load coupon"));
        router.push("/admin/coupons");
      } finally {
        setIsLoading(false);
      }
    };

    if (couponId) {
      loadPromotion();
    }
  }, [couponId, router]);

  const handleSave = async (data: CouponFormData) => {
    try {
      await adminApi.updateCoupon(couponId, data);
      router.push("/admin/coupons");
    } catch (error) {
      throw error;
    }
  };

  if (isLoading) {
    return <LoadingSpinner variant="full" />;
  }

  if (!coupon) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Coupon</h1>
          <p className="mt-1 text-sm text-gray-500">{coupon.code}</p>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
        <CouponForm coupon={coupon} onSave={handleSave} />
      </div>
    </div>
  );
}
