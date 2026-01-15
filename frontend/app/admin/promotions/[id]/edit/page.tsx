"use client";

import React, { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { PromotionForm } from "../../_components/PromotionForm";
import { Heading, Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import { getAllPromotions } from "@/lib/mock-data/mock-data";

export default function EditPromotionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const promotion = useMemo(() => {
    return getAllPromotions().find((p) => p.id === id);
  }, [id]);

  if (!promotion) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary-500 mb-4" />
        <Heading level="h3">Loading promotion...</Heading>
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
