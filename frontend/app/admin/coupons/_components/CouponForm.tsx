"use client";

import React from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { couponSchema, type CouponFormData } from "@/features/coupons/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Stack } from "@/components/ui/stack";
import { Heading, Text } from "@/components/ui/typography";
import { Loader2, Percent, DollarSign, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { useCreateCouponMutation, useUpdateCouponMutation } from "@/features/coupons/queries";
import type { Coupon } from "@/features/coupons/api";

interface CouponFormProps {
  coupon?: Coupon;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CouponForm({
  coupon,
  onSuccess,
  onCancel,
}: CouponFormProps) {
  const createMutation = useCreateCouponMutation();
  const updateMutation = useUpdateCouponMutation();
  const isEditMode = !!coupon?.id;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CouponFormData>({
    resolver: yupResolver(couponSchema) as Resolver<CouponFormData>,
    defaultValues: {
      code: coupon?.code || "",
      description: coupon?.description || "",
      type: coupon?.type || "PERCENTAGE",
      value: coupon?.value || undefined,
      minOrderTotal: coupon?.minOrderTotal || undefined,
      startsAt: coupon?.startsAt ? new Date(coupon.startsAt).toISOString().split('T')[0] : undefined,
      expiresAt: coupon?.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : undefined,
      usageLimit: coupon?.usageLimit || undefined,
      perUserLimit: coupon?.perUserLimit || 1,
      isActive: coupon?.isActive !== false,
    },
  });

  const discountType = watch("type");
  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (data: CouponFormData) => {
    try {
      // Normalize code to uppercase
      const normalizedData = {
        ...data,
        code: data.code.toUpperCase().trim(),
        // Convert empty strings to null for optional fields
        minOrderTotal: data.minOrderTotal || null,
        startsAt: data.startsAt || null,
        expiresAt: data.expiresAt || null,
        usageLimit: data.usageLimit || null,
        perUserLimit: data.perUserLimit || null,
      };

      if (isEditMode && coupon?.id) {
        await updateMutation.mutateAsync({
          id: coupon.id,
          data: normalizedData,
        });
      } else {
        await createMutation.mutateAsync(normalizedData);
      }

      onSuccess();
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error("Failed to save coupon:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing="xl">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border-warm-gray-200 shadow-sm rounded-lg">
              <Heading level="h4" className="text-sm font-bold uppercase tracking-wider text-warm-gray-400 mb-6">
                Basic Information
              </Heading>

              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Input
                      label="Coupon Code *"
                      placeholder="e.g. SUMMER2024"
                      className="uppercase font-mono tracking-wider"
                      {...register("code")}
                      error={!!errors.code}
                    />
                    {errors.code?.message && (
                      <Text className="text-xs text-red-600 px-1" role="alert">
                        {errors.code.message}
                      </Text>
                    )}
                    <Text className="text-[10px] text-warm-gray-400 px-1 italic">
                      Customers will enter this code at checkout
                    </Text>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-col gap-1.5">
                      <Text className="text-sm font-medium text-warm-gray-700">
                        Discount Type *
                      </Text>
                      <div className="flex items-center bg-warm-gray-100 rounded-lg p-1 w-full max-w-[300px]">
                        <button
                          type="button"
                          onClick={() => setValue("type", "PERCENTAGE")}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                            discountType === "PERCENTAGE"
                              ? "bg-white text-primary-600 shadow-sm"
                              : "text-warm-gray-500 hover:text-warm-gray-700"
                          )}
                        >
                          <Percent className="w-4 h-4" /> Percentage
                        </button>
                        <button
                          type="button"
                          onClick={() => setValue("type", "FIXED_AMOUNT")}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                            discountType === "FIXED_AMOUNT"
                              ? "bg-white text-primary-600 shadow-sm"
                              : "text-warm-gray-500 hover:text-warm-gray-700"
                          )}
                        >
                          <DollarSign className="w-4 h-4" /> Fixed Amount
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Textarea
                    label="Description *"
                    placeholder="e.g. Get 20% off all orders during summer sale!"
                    rows={3}
                    {...register("description")}
                    error={errors.description?.message}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Input
                      label={discountType === "PERCENTAGE" ? "Percentage Value (%) *" : "Discount Amount ($) *"}
                      type="number"
                      placeholder={discountType === "PERCENTAGE" ? "20" : "15.00"}
                      {...register("value")}
                      error={!!errors.value}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      label="Minimum Order Total ($)"
                      type="number"
                      placeholder="0.00"
                      {...register("minOrderTotal")}
                      error={!!errors.minOrderTotal}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-warm-gray-200 shadow-sm rounded-lg">
              <Heading level="h4" className="text-sm font-bold uppercase tracking-wider text-warm-gray-400 mb-6">
                Usage Limits
              </Heading>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Input
                    label="Total Usage Limit"
                    type="number"
                    placeholder="e.g. 100"
                    {...register("usageLimit")}
                    error={!!errors.usageLimit}
                  />
                  <Text className="text-[10px] text-warm-gray-400 px-1 italic">
                    Maximum number of times this coupon can be used
                  </Text>
                </div>
                <div className="space-y-2">
                  <Input
                    label="Per User Limit"
                    type="number"
                    placeholder="1"
                    {...register("perUserLimit")}
                    error={!!errors.perUserLimit}
                  />
                  <Text className="text-[10px] text-warm-gray-400 px-1 italic">
                    How many times a single customer can use it
                  </Text>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar Config */}
          <div className="space-y-6">
            <Card className="p-6 border-warm-gray-200 shadow-sm rounded-lg">
              <Heading level="h4" className="text-sm font-bold uppercase tracking-wider text-warm-gray-400 mb-6">
                Visibility & Status
              </Heading>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-warm-gray-50 rounded-lg">
                  <div className="space-y-0.5">
                    <Text className="text-sm font-bold text-warm-gray-900">Active Status</Text>
                    <Text className="text-xs text-warm-gray-500">Enable or disable this coupon</Text>
                  </div>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      label="Starts At"
                      type="date"
                      {...register("startsAt")}
                      error={!!errors.startsAt}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      label="Expires At"
                      type="date"
                      {...register("expiresAt")}
                      error={!!errors.expiresAt}
                    />
                  </div>
                </div>

                <div className="p-4 bg-primary-50 rounded-lg flex gap-3">
                  <Info className="w-5 h-5 text-primary-600 shrink-0" />
                  <Text className="text-xs text-primary-700 leading-relaxed">
                    Coupons will only be valid between the start and end dates if provided.
                  </Text>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-warm-gray-100 mt-4">
            <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="rounded-lg px-8 min-w-[150px] shadow-md hover:shadow-lg transition-all duration-200 bg-primary-600 hover:bg-primary-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              coupon ? "Update Coupon" : "Create Coupon"
            )}
          </Button>
        </div>
      </Stack>
    </form>
  );
}
