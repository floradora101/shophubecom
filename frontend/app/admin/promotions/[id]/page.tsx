// Admin page for editing a promotion (separate from coupons)
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PromotionForm } from "@/components/admin/promotions/PromotionForm";
import { adminApi } from "@/lib/data/mockAdmin";
import type { Promotion } from "@/lib/types/product.types";
import type { PromotionFormData } from "@/lib/validations/promotion.schemas";

export default function EditPromotionPage() {
  const router = useRouter();
  const params = useParams();
  const promotionId = params.id as string;
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPromotion = async () => {
      try {
        const data = await adminApi.getPromotion(promotionId);
        if (data) {
          setPromotion(data);
        } else {
          alert("Promotion not found");
          router.push("/admin/promotions");
        }
      } catch (error) {
        console.error("Failed to load promotion:", error);
        alert("Failed to load promotion");
        router.push("/admin/promotions");
      } finally {
        setIsLoading(false);
      }
    };

    if (promotionId) {
      loadPromotion();
    }
  }, [promotionId, router]);

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
      await adminApi.updatePromotion(promotionId, cleanedData);
      router.push("/admin/promotions");
    } catch (error) {
      console.error("Failed to update promotion:", error);
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

  if (!promotion) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Promotion</h1>
          <p className="mt-1 text-sm text-gray-500">{promotion.name}</p>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
        <PromotionForm promotion={promotion} onSave={handleSave} />
      </div>
    </div>
  );
}
