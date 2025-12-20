"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormErrorAlert } from "@/components/ui/form-error-alert";
import { FormField } from "@/components/ui/form-field";
import { useFormErrorHandler } from "@/lib/forms/useFormErrorHandler";
import { useFormDraft } from "@/lib/forms/useFormDraft";
import { useAdminAllCategoriesQuery } from "@/features/admin/queries/categories";
import { useAdminAllProductsQuery } from "@/features/admin/queries/products";
import type { Promotion } from "@/features/products/types";
import {
  promotionSchema,
  type PromotionFormData,
} from "@/features/admin/schemas/promotion";

interface PromotionFormProps {
  promotion?: Promotion;
  onSave: (data: PromotionFormData) => Promise<void>;
}

export function PromotionForm({ promotion, onSave }: PromotionFormProps) {
  const router = useRouter();

  // Use React Query hooks - automatically cached and shared across components
  const { data: products = [] } = useAdminAllProductsQuery();
  const { data: categories = [] } = useAdminAllCategoriesQuery();

  const form = useForm<PromotionFormData>({
    resolver: yupResolver(promotionSchema) as any,
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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  // Enable draft persistence only for create mode
  const { clearDraft } = useFormDraft(form, {
    key: `draft:promotion:${promotion?.id || "new"}`,
    storage: "local",
    enabled: !promotion,
  });

  const { formError, handleError, handleValidationError, clearError } =
    useFormErrorHandler({
      fallbackMessage: "Failed to save promotion. Please try again.",
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
    clearError();
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
      if (!promotion) {
        clearDraft();
        reset();
      }
      toast.success("Promotion saved");
    } catch (error) {
      handleError(error);
      toast.error(formError || "Failed to save promotion");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, handleValidationError)}
      className="space-y-6"
      noValidate
      aria-label={promotion ? "Edit promotion form" : "Create promotion form"}
    >
      <FormErrorAlert error={formError} onDismiss={clearError} dismissible />

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Name" required error={errors.name?.message}>
            <Input
              {...register("name")}
              placeholder="Holiday Sale"
              className={errors.name ? "border-red-500" : ""}
            />
          </FormField>

          <FormField label="Type" required error={errors.type?.message}>
            <select
              {...register("type")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              aria-invalid={!!errors.type}
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED_AMOUNT">Fixed amount</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <FormField
              label="Description"
              error={errors.description?.message}
              helpText="Optional description"
            >
              <textarea
                {...register("description")}
                rows={3}
                placeholder="Optional description"
                className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                  errors.description ? "border-red-500" : ""
                }`}
                aria-invalid={!!errors.description}
              />
            </FormField>
          </div>
          <FormField label="Value" required error={errors.value?.message}>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register("value", { valueAsNumber: true })}
              className={errors.value ? "border-red-500" : ""}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Starts at" error={errors.startsAt?.message}>
            <Input type="datetime-local" {...register("startsAt")} />
          </FormField>
          <FormField label="Expires at" error={errors.expiresAt?.message}>
            <Input type="datetime-local" {...register("expiresAt")} />
          </FormField>
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
