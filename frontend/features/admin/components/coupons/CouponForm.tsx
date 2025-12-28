"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormErrorAlert } from "@/components/ui/form-error-alert";
import { FormField } from "@/components/ui/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormErrorHandler } from "@/lib/forms/useFormErrorHandler";
import { useFormDraft } from "@/lib/forms/useFormDraft";
import type { Coupon } from "@/features/products/types";
import {
  couponSchema,
  type CouponFormData,
} from "@/features/admin/schemas/coupon";

interface CouponFormProps {
  coupon?: Coupon;
  onSave: (data: CouponFormData) => Promise<void>;
}

export function CouponForm({ coupon, onSave }: CouponFormProps) {
  const router = useRouter();
  const form = useForm<CouponFormData>({
    resolver: yupResolver(couponSchema) as any,
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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  // Enable draft persistence only for create mode
  const { clearDraft } = useFormDraft(form, {
    key: `draft:coupon:${coupon?.id || "new"}`,
    storage: "local",
    enabled: !coupon,
  });

  const { formError, handleError, handleValidationError, clearError } =
    useFormErrorHandler({
      fallbackMessage: "Failed to save coupon. Please try again.",
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
    clearError();
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
      if (!coupon) {
        clearDraft();
        reset();
      }
      toast.success("Coupon saved");
    } catch (error) {
      handleError(error);
      toast.error(formError || "Failed to save coupon");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, handleValidationError)}
      className="space-y-6"
      noValidate
      aria-label={coupon ? "Edit coupon form" : "Create coupon form"}
    >
      <FormErrorAlert error={formError} onDismiss={clearError} dismissible />

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <FormField label="Code" required error={errors.code?.message}>
          <Input
            {...register("code")}
            placeholder="SALE20"
            error={errors.code?.message}
          />
        </FormField>

        <FormField
          label="Description"
          error={errors.description?.message}
          helpText="Optional description"
        >
          <Textarea
            {...register("description")}
            rows={3}
            placeholder="Optional description"
            error={errors.description?.message}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Discount type"
            required
            error={errors.type?.message}
          >
            <Select
              value={watch("type")}
              onValueChange={(value) =>
                setValue("type", value as "PERCENTAGE" | "FIXED_AMOUNT")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                <SelectItem value="FIXED_AMOUNT">Fixed amount</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Value" required error={errors.value?.message}>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register("value", { valueAsNumber: true })}
              error={errors.value?.message}
            />
          </FormField>
          <FormField
            label="Minimum order total"
            error={errors.minOrderTotal?.message}
            helpText="Optional minimum order amount"
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register("minOrderTotal", { valueAsNumber: true })}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Usage limit"
            error={errors.usageLimit?.message}
            helpText="Maximum total uses (optional)"
          >
            <Input
              type="number"
              min="1"
              {...register("usageLimit", { valueAsNumber: true })}
            />
          </FormField>
          <FormField
            label="Per-user limit"
            error={errors.perUserLimit?.message}
            helpText="Maximum uses per user (optional)"
          >
            <Input
              type="number"
              min="1"
              {...register("perUserLimit", { valueAsNumber: true })}
            />
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
