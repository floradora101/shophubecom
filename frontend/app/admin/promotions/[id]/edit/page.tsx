"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { PromotionForm } from "@/app/admin/promotions/_components/PromotionForm";
import { Heading, Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import { usePromotionQuery } from "@/features/promotions/queries";
import { extractErrorMessage } from "@/lib/api/error-handler";

export default function EditPromotionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: promotion, isLoading, error } = usePromotionQuery(id);

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary-500 mb-4" />
        <Heading level="h3">Loading promotion...</Heading>
      </div>
    );
  }

  if (error || !promotion) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <Heading level="h3">Promotion not found</Heading>
        <Text className="text-warm-gray-500">
          {extractErrorMessage(error, "The promotion you're looking for doesn't exist.")}
        </Text>
        <Button onClick={() => router.push("/admin/promotions")} variant="outline">
          Back to Promotions
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/promotions")}
          className="w-fit -ml-2 text-warm-gray-500 hover:text-warm-gray-900"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Promotions
        </Button>
        <div>
          <Heading level="h2">Edit Promotion</Heading>
          <Text className="text-warm-gray-500">
            Update the details and rules for "{promotion.name}".
          </Text>
        </div>
      </div>

      <PromotionForm
        promotion={promotion}
        onSuccess={() => router.push("/admin/promotions")}
        onCancel={() => router.push("/admin/promotions")}
      />
    </div>
  );
}
