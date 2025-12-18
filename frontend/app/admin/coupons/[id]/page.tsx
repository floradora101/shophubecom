// Admin page for editing a promotion or coupon.
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { CouponForm } from "@/components/admin/coupons/CouponForm";
import { adminApi } from "@/lib/data/mockAdmin";
import type { Coupon } from "@/lib/types/product.types";
import type { CouponFormData } from "@/lib/validations/coupon.schemas";

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
          alert("Coupon not found");
          router.push("/admin/coupons");
        }
      } catch (error) {
        console.error("Failed to load coupon:", error);
        alert("Failed to load coupon");
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
      console.error("Failed to update coupon:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading promotion...</p>
        </div>
      </div>
    );
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
