"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminLoadingState } from "@/app/admin/_components/AdminLoadingState";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { CouponForm } from "@/app/admin/coupons/_components/CouponForm";
import { useCouponByIdQuery } from "@/features/coupons/queries";

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const couponId = params.id as string;

  const { data: coupon, isLoading, error } = useCouponByIdQuery(couponId);

  if (isLoading) {
    return <AdminLoadingState message="Loading coupon..." />;
  }

  if (error || !coupon) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Text className="text-red-500">Failed to load coupon. Please try again.</Text>
        <Button onClick={() => router.push("/admin/coupons")}>
          Back to Coupons
        </Button>
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
