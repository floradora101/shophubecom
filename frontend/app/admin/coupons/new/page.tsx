// Admin page for creating a promotion or coupon.
"use client";

import { useRouter } from "next/navigation";
import { adminApi } from "@/dev/mocks/mockAdmin";
import { PromotionForm } from "@/features/admin/components/promotions/PromotionForm";
import type { PromotionFormData } from "@/features/admin/schemas/promotion";

export default function NewPromotionPage() {
  const router = useRouter();

  const handleSave = async (data: PromotionFormData) => {
    try {
      // Filter out undefined values from arrays to match Promotion type
      const cleanedData = {
        ...data,
        applicableProductIds: data.applicableProductIds
          ? data.applicableProductIds.filter(
              (id): id is string => id !== undefined
            )
          : undefined,
        applicableCategoryIds: data.applicableCategoryIds
          ? data.applicableCategoryIds.filter(
              (id): id is string => id !== undefined
            )
          : undefined,
      };
      await adminApi.createPromotion(cleanedData);
      router.push("/admin/coupons");
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Promotion
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new discount code or automatic promotion
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
        <PromotionForm onSave={handleSave} />
      </div>
    </div>
  );
}
