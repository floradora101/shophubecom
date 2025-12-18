// Admin page for creating a promotion (separate from coupons)
"use client";

import { useRouter } from "next/navigation";
import { PromotionForm } from "@/components/admin/promotions/PromotionForm";
import { adminApi } from "@/lib/data/mockAdmin";
import type { PromotionFormData } from "@/lib/validations/promotion.schemas";

export default function NewPromotionPage() {
  const router = useRouter();

  const handleSave = async (data: PromotionFormData) => {
    try {
      await adminApi.createPromotion(data);
      router.push("/admin/promotions");
    } catch (error) {
      console.error("Failed to create promotion:", error);
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
            Add a new sale or auto-applied promotion
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
