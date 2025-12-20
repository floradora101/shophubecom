// Admin page for editing a promotion (separate from coupons)
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { PromotionForm } from "@/features/admin/components/promotions/PromotionForm";
import { adminApi } from "@/dev/mocks/mockAdmin";
import { extractErrorMessage } from "@/lib/utils/error-handler";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Promotion } from "@/features/products/types";
import type { PromotionFormData } from "@/features/admin/schemas/promotion";

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
          toast.error("Promotion not found");
          router.push("/admin/promotions");
        }
      } catch (error) {
        toast.error(extractErrorMessage(error, "Failed to load promotion"));
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
      throw error;
    }
  };

  if (isLoading) {
    return <LoadingSpinner variant="full" />;
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
