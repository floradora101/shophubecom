"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PromotionForm } from "../_components/PromotionForm";
import { Heading, Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function NewPromotionPage() {
  const router = useRouter();

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
          <Heading level="h2">Create New Promotion</Heading>
          <Text className="text-warm-gray-500">
            Set up a new discount rule for your products or categories.
          </Text>
        </div>
      </div>

      <PromotionForm
        onSuccess={() => router.push("/admin/promotions")}
        onCancel={() => router.push("/admin/promotions")}
      />
    </div>
  );
}
