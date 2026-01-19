"use client";

import React, { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { CouponForm } from "@/app/admin/coupons/_components/CouponForm";
import { mockCoupons } from "@/lib/mock-data/mock-data";

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const couponId = params.id as string;

  const coupon = useMemo(() => {
    return mockCoupons.find((c) => c.id === couponId);
  }, [couponId]);

  if (!coupon) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        <Text>Loading coupon details...</Text>
      </div>
    );
  }

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
          <Heading level="h2">Edit Coupon: <span className="text-primary-600 font-mono">{coupon.code}</span></Heading>
          <Text className="text-warm-gray-500">
            Update the configuration for this discount code.
          </Text>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-warm-gray-200 shadow-sm p-8">
        <CouponForm
          coupon={coupon}
          onSuccess={() => router.push("/admin/coupons")}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
