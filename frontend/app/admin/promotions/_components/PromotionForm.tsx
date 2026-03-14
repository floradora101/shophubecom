"use client";

import React from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { promotionSchema, type PromotionFormData } from "@/features/promotions/schemas";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Stack } from "@/components/ui/stack";
import { Heading, Text } from "@/components/ui/typography";
import { toast } from "sonner";
import { Percent, DollarSign, Info, Tag, Package, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { ProductPicker } from "@/features/products/components/product-picker";
import { CategoryPicker } from "@/features/categories/components/category-picker";
import { ProductImageUploader } from "@/features/products/components/product-image-uploader";
import { promotionsApi } from "@/features/promotions/api";
import { useQueryClient } from "@tanstack/react-query";

interface PromotionFormProps {
  promotion?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PromotionForm({
  promotion,
  onSuccess,
  onCancel,
}: PromotionFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PromotionFormData>({
    resolver: yupResolver(promotionSchema) as Resolver<PromotionFormData>,
    defaultValues: {
      name: promotion?.name || "",
      description: promotion?.description || "",
      type: promotion?.type || "PERCENTAGE",
      value: promotion?.value || undefined,
      startsAt: promotion?.startsAt ? new Date(promotion.startsAt).toISOString().split('T')[0] : undefined,
      expiresAt: promotion?.expiresAt ? new Date(promotion.expiresAt).toISOString().split('T')[0] : undefined,
      isActive: promotion?.isActive !== false,
      productIds: promotion?.productIds || [],
      categoryIds: promotion?.categoryIds || [],
      heroImageUrl: promotion?.heroImageUrl ?? "",
      createHeroSlide: !!promotion?.heroSlideId,
    },
  });

  const discountType = watch("type");
  const createHeroSlide = watch("createHeroSlide");
  const queryClient = useQueryClient();

  const onSubmit = async (data: PromotionFormData) => {
    try {
      const { createHeroSlide: _createHeroSlide, ...rest } = data;
      const payload = {
        ...rest,
        value: Number(data.value),
        startsAt: data.startsAt?.trim() || undefined,
        expiresAt: data.expiresAt?.trim() || undefined,
        // Only send heroImageUrl when "Show on hero" is on; backend uses promotion name/description for slide text
        heroImageUrl: data.createHeroSlide ? (data.heroImageUrl?.trim() || null) : undefined,
      };

      if (promotion) {
        await promotionsApi.updatePromotion(promotion.id, payload);
        toast.success("Promotion updated successfully!");
      } else {
        await promotionsApi.createPromotion(payload);
        toast.success("Promotion created successfully!");
      }

      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      onSuccess();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string | string[]; errors?: string[] } }; message?: string };
      let errorMessage = "Failed to save promotion. Please try again.";
      if (axiosError?.response?.data) {
        const d = axiosError.response.data;
        if (d.errors?.length) {
          errorMessage = d.errors.join(", ");
        } else if (Array.isArray(d.message)) {
          errorMessage = d.message.join(", ");
        } else if (typeof d.message === "string") {
          errorMessage = d.message;
        }
      } else if (axiosError?.message) {
        errorMessage = axiosError.message;
      }
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing="xl">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border-warm-gray-200 shadow-sm rounded-lg">
              <Heading level="h4" className="text-sm font-bold uppercase tracking-wider text-warm-gray-400 mb-6 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Basic Information
              </Heading>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Input
                    label="Promotion Name *"
                    placeholder="e.g. Summer Clearance Sale"
                    {...register("name")}
                    error={!!errors.name?.message}
                  />
                  <Text className="text-[10px] text-warm-gray-400 px-1 italic">
                    Internal name for this promotion
                  </Text>
                </div>

                <div className="space-y-2">
                  <Textarea
                    label="Description *"
                    placeholder="e.g. Get 20% off all summer items!"
                    rows={3}
                    {...register("description")}
                    error={errors.description?.message}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex flex-col gap-1.5">
                      <Text className="text-sm font-medium text-warm-gray-700">
                        Discount Type *
                      </Text>
                      <div className="flex items-center bg-warm-gray-100 rounded-lg p-1 w-full">
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

                  <div className="space-y-2">
                    <Input
                      label={discountType === "PERCENTAGE" ? "Percentage Value (%) *" : "Discount Amount ($) *"}
                      type="number"
                      placeholder={discountType === "PERCENTAGE" ? "20" : "15.00"}
                      {...register("value")}
                      error={!!errors.value?.message}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-warm-gray-200 shadow-sm rounded-lg">
              <Heading level="h4" className="text-sm font-bold uppercase tracking-wider text-warm-gray-400 mb-6 flex items-center gap-2">
                <Package className="w-4 h-4" /> Applicable Items
              </Heading>

              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text className="text-sm font-bold text-warm-gray-900">Products</Text>
                      <Text className="text-xs text-warm-gray-500">Select specific products for this promotion</Text>
                    </div>
                  </div>
                  <Controller
                    name="productIds"
                    control={control}
                    render={({ field }) => (
                      <ProductPicker
                        multiple
                        valueField="id"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Search products to add..."
                      />
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text className="text-sm font-bold text-warm-gray-900">Categories</Text>
                      <Text className="text-xs text-warm-gray-500">Apply promotion to all products in these categories</Text>
                    </div>
                  </div>
                  <Controller
                    name="categoryIds"
                    control={control}
                    render={({ field }) => (
                      <CategoryPicker
                        multiple
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Search categories to add..."
                      />
                    )}
                  />
                </div>

                <div className="p-4 bg-amber-50 rounded-lg flex gap-3 border border-amber-100">
                  <Info className="w-5 h-5 text-amber-600 shrink-0" />
                  <Text className="text-xs text-amber-700 leading-relaxed">
                    If both products and categories are selected, the promotion will apply to all of them.
                    If none are selected, the promotion will not be applied to any products.
                  </Text>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-warm-gray-200 shadow-sm rounded-lg mt-6">
              <Heading level="h4" className="text-sm font-bold uppercase tracking-wider text-warm-gray-400 mb-6 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Hero slide
              </Heading>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg border border-primary-100">
                  <div className="space-y-0.5">
                    <Text className="text-sm font-bold text-primary-900">Show on homepage hero</Text>
                    <Text className="text-xs text-primary-600">Create a slide from this promotion. Headline and description come from the fields above; you can add an optional image below.</Text>
                  </div>
                  <Controller
                    name="createHeroSlide"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                {createHeroSlide && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Text className="text-sm font-medium text-warm-gray-700">Slide image (optional)</Text>
                    <Controller
                      name="heroImageUrl"
                      control={control}
                      render={({ field }) => (
                        <ProductImageUploader
                          value={field.value ? [field.value] : []}
                          onChange={(urls) => field.onChange(urls[0] ?? "")}
                          maxFiles={1}
                          label="Hero image"
                        />
                      )}
                    />
                    <Text className="text-[10px] text-warm-gray-400 px-1 italic">
                      Landscape recommended (e.g. 1920×800). Headline and description are taken from the promotion name and description above.
                    </Text>
                  </div>
                )}
              </div>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="p-6 border-warm-gray-200 shadow-sm rounded-lg">
              <Heading level="h4" className="text-sm font-bold uppercase tracking-wider text-warm-gray-400 mb-6">
                Status & Schedule
              </Heading>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-warm-gray-50 rounded-lg">
                  <div className="space-y-0.5">
                    <Text className="text-sm font-bold text-warm-gray-900">Active Status</Text>
                    <Text className="text-xs text-warm-gray-500">Enable or disable this promotion</Text>
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
                      error={!!errors.startsAt?.message}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      label="Expires At"
                      type="date"
                      {...register("expiresAt")}
                      error={!!errors.expiresAt?.message}
                    />
                  </div>
                </div>

                <div className="p-4 bg-primary-50 rounded-lg flex gap-3">
                  <Info className="w-5 h-5 text-primary-600 shrink-0" />
                  <Text className="text-xs text-primary-700 leading-relaxed">
                    Promotions will only be active between these dates. Leave blank for no limit.
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
            disabled={isSubmitting}
            className="rounded-lg px-6"
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            loading={isSubmitting}
            loadingText="Saving..."
            className="rounded-lg px-8 min-w-[150px] shadow-md hover:shadow-lg transition-all duration-200 bg-primary-600 hover:bg-primary-700"
          >
            {promotion ? "Update Promotion" : "Create Promotion"}
          </LoadingButton>
        </div>
      </Stack>
    </form>
  );
}
