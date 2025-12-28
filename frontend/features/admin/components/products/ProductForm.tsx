"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type SubmitHandler,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product, VariantOptions } from "@/features/products/types";
import {
  productSchema,
  type ProductFormData,
} from "@/features/products/schemas";
import { useAdminAllCategoriesQuery } from "@/features/admin/queries/categories";
import type {
  CreateProductPayload,
  UpdateProductPayload,
} from "@/features/admin/api/products";
import { useFormDraft } from "@/lib/forms/useFormDraft";
import { VariantImagesUploader } from "./VariantImagesUploader";

interface ProductFormProps {
  product?: Product;
  onSave: (data: CreateProductPayload | UpdateProductPayload) => Promise<void>;
}

type VariantOptionPair = { name: string; value: string };

const COMMON_OPTION_NAMES = ["Color", "Size", "Storage", "Material"];

const optionsRecordToPairs = (
  options?: VariantOptions
): VariantOptionPair[] => {
  if (!options) return [];
  return Object.entries(options).map(([name, value]) => ({ name, value }));
};

export function ProductForm({ product, onSave }: ProductFormProps) {
  const router = useRouter();
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkDialogType, setBulkDialogType] = useState<
    "price" | "stock" | null
  >(null);
  const [bulkValue, setBulkValue] = useState<string>("");
  const [bulkDialogError, setBulkDialogError] = useState<string | null>(null);

  const form = useForm<ProductFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(productSchema) as any,
    defaultValues: product
      ? {
          name: product.name,
          description: product.description ?? "",
          currency: product.currency || "USD",
          categoryId: product.categoryId ?? undefined,
          isOnSale: product.isOnSale ?? false,
          discountType: product.discountType ?? undefined,
          discountValue: product.discountValue ?? undefined,
          saleStartsAt: product.saleStartsAt
            ? product.saleStartsAt.substring(0, 10)
            : "",
          saleEndsAt: product.saleEndsAt
            ? product.saleEndsAt.substring(0, 10)
            : "",
          promotionIds: product.promotionIds ?? [],
          defaultVariantId: product.defaultVariantId ?? null,
          variants:
            product.variants && product.variants.length > 0
              ? product.variants.map((variant) => ({
                  id: variant.id,
                  sku: variant.sku,
                  price: variant.price,
                  stock: variant.stock,
                  image: variant.image,
                  images: variant.images,
                  options: optionsRecordToPairs(variant.options),
                }))
              : [
                  {
                    sku: "",
                    price: undefined,
                    stock: undefined,
                    image: "",
                    images: [],
                    options: [],
                  },
                ],
        }
      : {
          name: "",
          description: "",
          currency: "USD",
          categoryId: "",
          isOnSale: false,
          discountType: undefined,
          discountValue: undefined,
          saleStartsAt: "",
          saleEndsAt: "",
          promotionIds: [],
          defaultVariantId: null,
          variants: [
            {
              sku: "",
              price: undefined,
              stock: undefined,
              image: "",
              images: [],
              options: [],
            },
          ],
        },
  });

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = form;

  // Enable draft persistence only for create mode (when product is undefined)
  const { clearDraft } = useFormDraft(form, {
    key: "draft:add-product",
    storage: "local",
    enabled: !product,
  });

  const { formError, handleError, handleValidationError, clearError } =
    useFormErrorHandler({
      fallbackMessage: "Failed to save product. Please try again.",
    });

  const watchedOnSale = watch("isOnSale");

  // Use useWatch for variants and currency to get reactive updates
  const watchedVariants = useWatch({ control, name: "variants" });
  const watchedCurrency = useWatch({ control, name: "currency" });

  const variants = useMemo(() => watchedVariants ?? [], [watchedVariants]);
  const currency = useMemo(
    () => (watchedCurrency ?? "USD").toUpperCase(),
    [watchedCurrency]
  );

  // Inline variant summary computation
  const variantSummary = useMemo(() => {
    const validPrices = variants
      .map((v) => v.price)
      .filter(
        (price): price is number => typeof price === "number" && price > 0
      );

    const validStocks = variants
      .map((v) => v.stock)
      .filter(
        (stock): stock is number => typeof stock === "number" && stock >= 0
      );

    const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;
    const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : null;
    const stockTotal = validStocks.reduce((sum, stock) => sum + stock, 0);
    const hasAnyPrice = validPrices.length > 0;
    const hasAnyStock = validStocks.length > 0;

    return { minPrice, maxPrice, stockTotal, hasAnyPrice, hasAnyStock };
  }, [variants]);

  // Memoized currency formatter
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
      }),
    [currency]
  );

  // Clear sale fields when isOnSale is unchecked
  useEffect(() => {
    if (!watchedOnSale) {
      setValue("discountType", undefined, { shouldValidate: false });
      setValue("discountValue", undefined, { shouldValidate: false });
      setValue("saleStartsAt", "", { shouldValidate: false });
      setValue("saleEndsAt", "", { shouldValidate: false });
    }
  }, [watchedOnSale, setValue]);

  // Price and stock are display-only, computed from variants (no form fields)

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariantBase,
  } = useFieldArray({
    control,
    name: "variants",
  });

  // Safe variant removal: auto-update defaultVariantId if removed variant was default
  const removeVariant = (index: number) => {
    const currentVariants = watch("variants");
    const variantToRemove = currentVariants?.[index];
    const currentDefaultVariantId = watch("defaultVariantId");

    // If removing the default variant, find a new default
    if (variantToRemove?.id && variantToRemove.id === currentDefaultVariantId) {
      // Find first remaining variant with an id
      const remainingVariants = currentVariants.filter(
        (_, idx) => idx !== index
      );
      const newDefaultVariant = remainingVariants.find((v) => v.id);
      if (newDefaultVariant?.id) {
        setValue("defaultVariantId", newDefaultVariant.id, {
          shouldDirty: true,
          shouldValidate: true,
        });
      } else {
        // No variants with ids left, set to null
        setValue("defaultVariantId", null, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    }

    removeVariantBase(index);
  };

  const addVariantOption = (
    variantIndex: number,
    preset?: VariantOptionPair
  ) => {
    const currentOptions = variants?.[variantIndex]?.options || [];
    setValue(`variants.${variantIndex}.options`, [
      ...currentOptions,
      preset || { name: "", value: "" },
    ]);
  };

  const addPresetOption = (variantIndex: number, name: string) => {
    addVariantOption(variantIndex, { name, value: "" });
  };

  const removeVariantOption = (variantIndex: number, optionIndex: number) => {
    const currentOptions = variants?.[variantIndex]?.options || [];
    const next = currentOptions.filter((_, idx) => idx !== optionIndex);
    setValue(`variants.${variantIndex}.options`, next);
  };

  // Inline function to convert option pairs to record
  const optionsPairsToRecord = (pairs?: VariantOptionPair[]) => {
    if (!pairs || pairs.length === 0) return undefined;
    const record: Record<string, string> = {};
    for (const pair of pairs) {
      const name = pair.name?.trim();
      const value = pair.value?.trim();
      if (name && value) {
        record[name] = value;
      }
    }
    return Object.keys(record).length > 0 ? record : undefined;
  };

  // DRY helper: Map form variants to payload variants
  const mapVariants = (
    formVariants: ProductFormData["variants"]
  ): Array<{
    id?: string;
    sku: string;
    price: number;
    stock: number;
    image?: string;
    images?: string[];
    options?: Record<string, string>;
  }> => {
    return formVariants.map((variant) => {
      // Normalize images: handle both string (comma-separated) and array formats
      let normalizedImages: string[] | undefined;
      if (variant.images) {
        const images: unknown = variant.images;
        if (typeof images === "string") {
          normalizedImages = images
            .split(",")
            .map((v: string) => v.trim())
            .filter(Boolean);
        } else if (Array.isArray(images)) {
          normalizedImages = images.filter(
            (img): img is string =>
              typeof img === "string" && img.trim().length > 0
          );
        }
      }

      return {
        ...(variant.id && { id: variant.id }),
        sku: variant.sku,
        price: variant.price!,
        stock: variant.stock!,
        ...(variant.image && { image: variant.image }),
        ...(normalizedImages &&
          normalizedImages.length > 0 && { images: normalizedImages }),
        ...(variant.options &&
          variant.options.length > 0 && {
            options: optionsPairsToRecord(variant.options),
          }),
      };
    });
  };

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    clearError();
    try {
      // Use DRY helper to map variants
      const mappedVariants = mapVariants(data.variants);

      if (product) {
        // Update payload - only include fields that are provided
        const updatePayload: UpdateProductPayload = {};
        if (data.name) updatePayload.name = data.name;
        if (data.description !== undefined)
          updatePayload.description = data.description;
        if (data.currency) updatePayload.currency = data.currency.toUpperCase();
        if (data.categoryId?.trim())
          updatePayload.categoryId = data.categoryId.trim();
        if (data.isOnSale !== undefined) updatePayload.isOnSale = data.isOnSale;
        if (data.isOnSale) {
          updatePayload.discountType = data.discountType ?? null;
          updatePayload.discountValue = data.discountValue ?? null;
          updatePayload.saleStartsAt = data.saleStartsAt || null;
          updatePayload.saleEndsAt = data.saleEndsAt || null;
        } else {
          updatePayload.discountType = null;
          updatePayload.discountValue = null;
          updatePayload.saleStartsAt = null;
          updatePayload.saleEndsAt = null;
        }
        if (data.defaultVariantId !== undefined) {
          updatePayload.defaultVariantId = data.defaultVariantId || null;
        }
        if (data.variants && data.variants.length > 0) {
          updatePayload.variants = mappedVariants;
        }
        await onSave(updatePayload);
      } else {
        // Create payload
        const categoryId = (data.categoryId?.trim() || "").trim();
        if (!categoryId) {
          throw new Error("Category is required for new products");
        }
        const createPayload: CreateProductPayload = {
          name: data.name,
          description: data.description || "",
          currency: data.currency.toUpperCase(),
          isOnSale: data.isOnSale || false,
          discountType: data.isOnSale ? data.discountType ?? null : null,
          discountValue: data.isOnSale ? data.discountValue ?? null : null,
          saleStartsAt: data.isOnSale ? data.saleStartsAt || null : null,
          saleEndsAt: data.isOnSale ? data.saleEndsAt || null : null,
          categoryId,
          isActive: true,
          variants: mappedVariants,
        };
        await onSave(createPayload);
        // Clear draft and reset form on successful create
        clearDraft();
        reset();
      }
      toast.success("Product saved");
    } catch (error) {
      handleError(error);
      toast.error(formError || "Failed to save product");
    }
  };

  const onError = (validationErrors: Record<string, { message?: string }>) => {
    handleValidationError(validationErrors as any);

    // Scroll to first error field after a short delay
    setTimeout(() => {
      const firstErrorField = document.querySelector(
        '[class*="border-red-500"], input[aria-invalid="true"], select[aria-invalid="true"]'
      );
      if (firstErrorField) {
        firstErrorField.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  };

  const handleBulkAction = (type: "price" | "stock") => {
    setBulkDialogType(type);
    setBulkValue("");
    setBulkDialogError(null);
    setBulkDialogOpen(true);
  };

  const applyBulkUpdate = () => {
    if (bulkDialogType === "price") {
      const price = parseFloat(bulkValue);
      if (isNaN(price) || price < 0) {
        setBulkDialogError("Price must be a number greater than or equal to 0");
        return;
      }
      variantFields.forEach((_, idx) => {
        setValue(`variants.${idx}.price`, price, {
          shouldValidate: true,
          shouldDirty: true,
        });
      });
    } else {
      const stock = parseInt(bulkValue, 10);
      if (isNaN(stock) || stock < 0) {
        setBulkDialogError("Stock must be a number greater than or equal to 0");
        return;
      }
      variantFields.forEach((_, idx) => {
        setValue(`variants.${idx}.stock`, stock, {
          shouldValidate: true,
          shouldDirty: true,
        });
      });
    }
    setBulkDialogOpen(false);
    setBulkValue("");
    setBulkDialogError(null);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="space-y-8"
      noValidate
      aria-label={product ? "Edit product form" : "Create product form"}
    >
      <FormErrorAlert error={formError} onDismiss={clearError} dismissible />

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Product details
            </h2>
            <p className="text-sm text-gray-500">
              Basic information required for a product record.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FormField label="Name" required error={errors.name?.message}>
              <Input
                {...register("name")}
                placeholder="e.g., Wireless Headphones"
                error={!!errors.name}
              />
            </FormField>
          </div>

          <div className="md:col-span-2">
            <FormField
              label="Description"
              error={errors.description?.message}
              helpText="Optional product description"
            >
              <Textarea
                {...register("description")}
                rows={3}
                placeholder="Short description"
                error={!!errors.description}
              />
            </FormField>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Starting from
            </label>
            <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {variantSummary.hasAnyPrice
                ? variantSummary.minPrice === variantSummary.maxPrice
                  ? currencyFormatter.format(variantSummary.minPrice!)
                  : `${currencyFormatter.format(
                      variantSummary.minPrice!
                    )} - ${currencyFormatter.format(variantSummary.maxPrice!)}`
                : "—"}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Derived from variant prices
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FormField
                label="Currency"
                error={errors.currency?.message}
                helpText="3-letter currency code (e.g., USD, EUR)"
              >
                <Input
                  {...register("currency")}
                  maxLength={3}
                  error={!!errors.currency}
                  onBlur={(e) =>
                    setValue("currency", e.target.value.toUpperCase())
                  }
                />
              </FormField>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Stock
              </label>
              <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                {variantSummary.hasAnyStock
                  ? variantSummary.stockTotal.toLocaleString()
                  : "—"}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Sum of all variant stocks
              </p>
            </div>
          </div>

          <div className="md:col-span-2 rounded-lg border border-gray-200 p-4 space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register("isOnSale")}
                className="h-4 w-4 rounded border-gray-300"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">On sale</p>
                <p className="text-xs text-gray-500">
                  Enable discount for this product
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount type
                </label>
                <select
                  {...register("discountType")}
                  disabled={!watchedOnSale}
                  className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                    errors.discountType ? "border-red-500" : ""
                  } ${!watchedOnSale ? "bg-gray-100 text-gray-500" : ""}`}
                >
                  <option value="">Select type</option>
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED_AMOUNT">Fixed amount</option>
                </select>
                {errors.discountType && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.discountType.message as string}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount value
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={!watchedOnSale}
                  {...register("discountValue", { valueAsNumber: true })}
                  error={!!errors.discountValue}
                  className={!watchedOnSale ? "bg-gray-100 text-gray-500" : ""}
                  placeholder={
                    watchedOnSale && watch("discountType") === "PERCENTAGE"
                      ? "e.g. 10 for 10%"
                      : "e.g. 5 for $5 off"
                  }
                />
                {errors.discountValue && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.discountValue.message as string}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Starts at
                </label>
                <Input
                  type="date"
                  disabled={!watchedOnSale}
                  {...register("saleStartsAt")}
                  className={!watchedOnSale ? "bg-gray-100 text-gray-500" : ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ends at
                </label>
                <Input
                  type="date"
                  disabled={!watchedOnSale}
                  {...register("saleEndsAt")}
                  className={!watchedOnSale ? "bg-gray-100 text-gray-500" : ""}
                />
              </div>
            </div>
          </div>

          <div>
            <FormField
              label="Category"
              required
              error={errors.categoryId?.message as string}
            >
              <CategorySelect
                controlName="categoryId"
                value={watch("categoryId") || ""}
                setValue={
                  setValue as ReturnType<
                    typeof useForm<ProductFormData>
                  >["setValue"]
                }
              />
            </FormField>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-md font-semibold text-gray-900">Variants</h3>
            {product && (
              <p className="text-xs text-gray-500 mt-1">
                Select a default variant to use as the product thumbnail image
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              appendVariant({
                sku: "",
                price: undefined,
                stock: undefined,
                image: "",
                images: [],
                options: [],
              } as unknown as ProductFormData["variants"][number]);
            }}
          >
            Add variant
          </Button>
        </div>

        {variantFields.length === 0 && (
          <p className="text-sm text-gray-500">No variants added yet.</p>
        )}

        {/* Bulk Actions */}
        {variantFields.length > 1 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">
              Bulk Actions
            </h4>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("price")}
              >
                Set price for all
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("stock")}
              >
                Set stock for all
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {variantFields.map((field, index) => {
            const variant = variants?.[index];
            const variantId = variant?.id;
            const defaultVariantId = watch("defaultVariantId");
            const isDefault = Boolean(
              product && variantId && defaultVariantId === variantId
            );

            return (
              <div
                key={field.id}
                className="rounded-lg border border-gray-200 p-4 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div>
                    <FormField
                      label="SKU"
                      required
                      error={errors.variants?.[index]?.sku?.message as string}
                    >
                      <Input
                        {...register(`variants.${index}.sku` as const)}
                        className={
                          errors.variants?.[index]?.sku ? "border-red-500" : ""
                        }
                      />
                    </FormField>
                  </div>
                  <div className="flex items-center gap-3">
                    {product && variantId && (
                      <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="defaultVariantId"
                          checked={isDefault ?? false}
                          onChange={() =>
                            setValue("defaultVariantId", variantId, {
                              shouldDirty: true,
                              shouldValidate: true,
                            })
                          }
                          className="h-4 w-4 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Set as Default
                        </span>
                        {isDefault && (
                          <span className="ml-1 text-xs text-primary-600 font-semibold">
                            (Current)
                          </span>
                        )}
                      </label>
                    )}
                    {!product && (
                      <p className="text-xs text-gray-500 italic">
                        Default will be set to first variant after creation
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeVariant(index)}
                      disabled={variantFields.length === 1}
                    >
                      Remove variant
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <FormField
                      label="Price"
                      required
                      error={errors.variants?.[index]?.price?.message as string}
                    >
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`variants.${index}.price` as const, {
                          valueAsNumber: true,
                        })}
                        className={
                          errors.variants?.[index]?.price
                            ? "border-red-500"
                            : ""
                        }
                      />
                    </FormField>
                  </div>
                  <div>
                    <FormField
                      label="Stock"
                      required
                      error={errors.variants?.[index]?.stock?.message as string}
                    >
                      <Input
                        type="number"
                        min="0"
                        {...register(`variants.${index}.stock` as const, {
                          valueAsNumber: true,
                        })}
                        className={
                          errors.variants?.[index]?.stock
                            ? "border-red-500"
                            : ""
                        }
                      />
                    </FormField>
                  </div>
                </div>

                {/* Options section */}
                <div className="space-y-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/80 p-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800">
                        Options (e.g., Color, Size)
                      </label>
                      <p className="text-xs text-gray-500">
                        Keep names consistent across variants (Color, Size,
                        Storage).
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_OPTION_NAMES.map((preset) => (
                        <Button
                          key={`${field.id}-preset-${preset}`}
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addPresetOption(index, preset)}
                        >
                          {preset}
                        </Button>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addVariantOption(index)}
                      >
                        + Custom
                      </Button>
                    </div>
                  </div>
                  {(variants?.[index]?.options || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 text-xs text-gray-700">
                      {(variants?.[index]?.options || []).map((opt, optIdx) => (
                        <span
                          key={`${field.id}-chip-${optIdx}`}
                          className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1"
                        >
                          <span className="font-semibold">
                            {opt?.name || "Key"}
                          </span>
                          <span className="text-gray-400">/</span>
                          <span>{opt?.value || "Value"}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  {(!variants?.[index]?.options ||
                    variants[index]?.options?.length === 0) && (
                    <p className="text-sm text-gray-500">
                      No options added for this variant.
                    </p>
                  )}
                  {(variants?.[index]?.options || []).map(
                    (_option, optionIndex) => (
                      <div
                        key={`${field.id}-option-${optionIndex}`}
                        className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <Input
                            {...register(
                              `variants.${index}.options.${optionIndex}.name` as const
                            )}
                            placeholder="Color"
                            className={
                              errors.variants?.[index]?.options?.[optionIndex]
                                ?.name
                                ? "border-red-500"
                                : ""
                            }
                          />
                          {errors.variants?.[index]?.options?.[optionIndex]
                            ?.name && (
                            <p className="mt-1 text-xs text-red-600">
                              {
                                errors.variants?.[index]?.options?.[optionIndex]
                                  ?.name?.message as string
                              }
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Value
                          </label>
                          <Input
                            {...register(
                              `variants.${index}.options.${optionIndex}.value` as const
                            )}
                            placeholder="Red / 128GB / Large"
                            className={
                              errors.variants?.[index]?.options?.[optionIndex]
                                ?.value
                                ? "border-red-500"
                                : ""
                            }
                          />
                          {errors.variants?.[index]?.options?.[optionIndex]
                            ?.value && (
                            <p className="mt-1 text-xs text-red-600">
                              {
                                errors.variants?.[index]?.options?.[optionIndex]
                                  ?.value?.message as string
                              }
                            </p>
                          )}
                        </div>
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeVariantOption(index, optionIndex)
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Hidden inputs for RHF to track image fields */}
                {/* These ensure RHF tracks the fields even when set via setValue */}
                {/* Don't use value prop - let RHF manage it via register */}
                <input
                  type="hidden"
                  {...register(`variants.${index}.image` as const)}
                />
                <input
                  type="hidden"
                  {...register(`variants.${index}.images` as const)}
                />

                <VariantImagesUploader
                  variantIndex={index}
                  mainImage={variant?.image}
                  galleryImages={
                    Array.isArray(variant?.images)
                      ? variant.images.filter(
                          (img): img is string => typeof img === "string"
                        )
                      : undefined
                  }
                  setValue={setValue}
                  trigger={trigger}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : product
            ? "Update product"
            : "Create product"}
        </Button>
      </div>

      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkDialogType === "price"
                ? "Set Price for All Variants"
                : "Set Stock for All Variants"}
            </DialogTitle>
            <DialogDescription>
              {bulkDialogType === "price"
                ? "Enter a price that will be applied to all variants."
                : "Enter a stock quantity that will be applied to all variants."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {bulkDialogType === "price" ? "Price" : "Stock"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step={bulkDialogType === "price" ? "0.01" : "1"}
                min="0"
                value={bulkValue}
                onChange={(e) => {
                  setBulkValue(e.target.value);
                  setBulkDialogError(null);
                }}
                placeholder={bulkDialogType === "price" ? "0.00" : "0"}
                className={bulkDialogError ? "border-red-500" : ""}
              />
              {bulkDialogError && (
                <p className="mt-1 text-xs text-red-600">{bulkDialogError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setBulkDialogOpen(false);
                setBulkValue("");
                setBulkDialogError(null);
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={applyBulkUpdate}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}

function CategorySelect({
  controlName,
  value,
  setValue,
}: {
  controlName: "categoryId";
  value: string;
  setValue: ReturnType<typeof useForm<ProductFormData>>["setValue"];
}) {
  // Use React Query hook - automatically cached and shared across components
  const { data: allCategories = [] } = useAdminAllCategoriesQuery();

  // Transform categories for the select dropdown
  const categories = React.useMemo(
    () =>
      allCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
      })),
    [allCategories]
  );

  return (
    <select
      value={value}
      onChange={(e) =>
        setValue(controlName, e.target.value, {
          shouldDirty: true,
          shouldValidate: true,
        })
      }
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
    >
      <option value="">Choose a category</option>
      {categories?.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}
