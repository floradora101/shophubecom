"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Coupon } from "@/lib/types/product.types";
import {
  couponSchema,
  type CouponFormData,
} from "@/lib/validations/coupon.schemas";

interface CouponFormProps {
  coupon?: Coupon;
  onSave: (data: CouponFormData) => Promise<void>;
}

export function CouponForm({ coupon, onSave }: CouponFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CouponFormData>({
    resolver: yupResolver(couponSchema),
    defaultValues: coupon
      ? {
          code: coupon.code,
          description: coupon.description ?? "",
          type: coupon.type || "PERCENTAGE",
          value: coupon.value,
          minOrderTotal: coupon.minOrderTotal ?? undefined,
          startsAt: coupon.startsAt || "",
          expiresAt: coupon.expiresAt || "",
          usageLimit: coupon.usageLimit ?? undefined,
          perUserLimit: coupon.perUserLimit ?? undefined,
          isActive: coupon.isActive,
        }
      : {
          code: "",
          description: "",
          type: "PERCENTAGE",
          value: 0,
          minOrderTotal: undefined,
          startsAt: "",
          expiresAt: "",
          usageLimit: undefined,
          perUserLimit: undefined,
          isActive: true,
        },
  });

  useEffect(() => {
    // Normalize datetime-local values for existing data
    if (coupon?.startsAt) {
      setValue("startsAt", coupon.startsAt.slice(0, 16));
    }
    if (coupon?.expiresAt) {
      setValue("expiresAt", coupon.expiresAt.slice(0, 16));
    }
  }, [coupon, setValue]);

  const onSubmit = async (data: CouponFormData) => {
    const payload: CouponFormData = {
      ...data,
      startsAt: data.startsAt
        ? new Date(data.startsAt).toISOString()
        : undefined,
      expiresAt: data.expiresAt
        ? new Date(data.expiresAt).toISOString()
        : undefined,
    };
    try {
      await onSave(payload);
    } catch (error) {
      console.error("Failed to save coupon:", error);
      alert("Failed to save coupon. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("code")}
              placeholder="SALE20"
              className={errors.code ? "border-red-500" : ""}
            />
            {errors.code && (
              <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={3}
            placeholder="Optional description"
            className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
              errors.description ? "border-red-500" : ""
            }`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount type <span className="text-red-500">*</span>
            </label>
            <select
              {...register("type")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED_AMOUNT">Fixed amount</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-xs text-red-600">{errors.type.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register("value")}
              className={errors.value ? "border-red-500" : ""}
            />
            {errors.value && (
              <p className="mt-1 text-xs text-red-600">
                {errors.value.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum order total
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register("minOrderTotal")}
            />
            {errors.minOrderTotal && (
              <p className="mt-1 text-xs text-red-600">
                {errors.minOrderTotal.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md-grid-cols-2 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Starts at
            </label>
            <Input type="datetime-local" {...register("startsAt")} />
            {errors.startsAt && (
              <p className="mt-1 text-xs text-red-600">
                {errors.startsAt.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expires at
            </label>
            <Input type="datetime-local" {...register("expiresAt")} />
            {errors.expiresAt && (
              <p className="mt-1 text-xs text-red-600">
                {errors.expiresAt.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usage limit
            </label>
            <Input type="number" min="1" {...register("usageLimit")} />
            {errors.usageLimit && (
              <p className="mt-1 text-xs text-red-600">
                {errors.usageLimit.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Per-user limit
            </label>
            <Input type="number" min="1" {...register("perUserLimit")} />
            {errors.perUserLimit && (
              <p className="mt-1 text-xs text-red-600">
                {errors.perUserLimit.message}
              </p>
            )}
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            {...register("isActive")}
            className="h-4 w-4"
          />
          Active
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : coupon
            ? "Update coupon"
            : "Create coupon"}
        </Button>
      </div>
    </form>
  );
}
