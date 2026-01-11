"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { CouponForm } from "../_components/CouponForm";

export default function NewCouponPage() {
  const router = useRouter();

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="w-fit -ml-2 text-warm-gray-500 hover:text-primary-600 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Coupons
        </Button>

        <div>
          <Heading level="h2">Create New Coupon</Heading>
          <Text className="text-warm-gray-500">
            Configure a new discount code for your store.
          </Text>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-warm-gray-200 shadow-sm p-8">
        <CouponForm
          onSuccess={() => router.push("/admin/coupons")}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
