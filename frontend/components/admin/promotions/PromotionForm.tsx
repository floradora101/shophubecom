"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminAllCategoriesQuery } from "@/lib/queries/admin/categories.queries";
import { useAdminAllProductsQuery } from "@/lib/queries/admin/products.queries";
import type { Promotion } from "@/lib/types/product.types";
import type { Category } from "@/lib/types/product.types";
import type { AdminProduct } from "@/lib/types/admin.types";
import {
  promotionSchema,
  type PromotionFormData,
} from "@/lib/validations/promotion.schemas";

interface PromotionFormProps {
  promotion?: Promotion;
  onSave: (data: PromotionFormData) => Promise<void>;
}

export function PromotionForm({ promotion, onSave }: PromotionFormProps) {
  const router = useRouter();

  // Use React Query hooks - automatically cached and shared across components
  const { data: products = [] } = useAdminAllProductsQuery();
  const { data: categories = [] } = useAdminAllCategoriesQuery();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PromotionFormData>({
    resolver: yupResolver(promotionSchema),
    defaultValues: promotion
      ? {
          name: promotion.name,
          description: promotion.description ?? "",
          type: promotion.type || promotion.discountType || "PERCENTAGE",
          value: promotion.value || promotion.discountValue || 0,
          startsAt: promotion.startsAt || promotion.startDate || "",
          expiresAt: promotion.expiresAt || promotion.endDate || "",
          isActive: promotion.isActive,
          applicableProductIds: promotion.applicableProductIds ?? [],
          applicableCategoryIds: promotion.applicableCategoryIds ?? [],
          applyToSubcategories:
            promotion.applyToSubcategories !== undefined
              ? promotion.applyToSubcategories
              : true,
        }
      : {
          name: "",
          description: "",
          type: "PERCENTAGE",
          value: 0,
          startsAt: "",
          expiresAt: "",
          isActive: true,
          applicableProductIds: [],
          applicableCategoryIds: [],
          applyToSubcategories: true,
        },
  });

  useEffect(() => {
    // Normalize datetime-local values for existing data
    if (promotion?.startsAt) {
      setValue("startsAt", promotion.startsAt.slice(0, 16));
    }
    if (promotion?.expiresAt) {
      setValue("expiresAt", promotion.expiresAt.slice(0, 16));
    }
  }, [promotion, setValue]);

  const onSubmit = async (data: PromotionFormData) => {
    const payload: PromotionFormData = {
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
      console.error("Failed to save promotion:", error);
      alert("Failed to save promotion. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("name")}
              placeholder="Holiday Sale"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type <span className="text-red-500">*</span>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            {...register("isActive")}
            className="h-4 w-4"
          />
          Active
        </label>

        <div className="border-t border-gray-200 pt-4 space-y-4">
          <h3 className="text-md font-semibold text-gray-900">
            Apply promotion to
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Products</p>
                <p className="text-xs text-gray-500">
                  Choose specific products
                </p>
              </div>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
                {products.length === 0 ? (
                  <p className="text-sm text-gray-500">No products found.</p>
                ) : (
                  products.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        value={p.id}
                        {...register("applicableProductIds")}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span>{p.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Categories</p>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register("applyToSubcategories")}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-xs text-gray-600">
                    Apply to subcategories
                  </span>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500">No categories found.</p>
                ) : (
                  categories.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        value={c.id}
                        {...register("applicableCategoryIds")}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span>{c.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : promotion
            ? "Update promotion"
            : "Create promotion"}
        </Button>
      </div>
    </form>
  );
}
