"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useForm, useFieldArray, Controller, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { productSchema, type ProductFormData } from "@/features/products/schemas";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Text, Heading } from "@/components/ui/typography";
import { extractErrorMessage } from "@/lib/api/error-handler";
import { CategoryPicker } from "@/features/categories/components/category-picker";
import { ProductImageUploader } from "@/features/products/components/product-image-uploader";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Layers,
  Image as ImageIcon,
  Tag,
  Package,
  CircleDollarSign,
  AlertCircle,
  HelpCircle,
  Settings2,
  X
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { useCreateProductMutation, useUpdateProductMutation } from "@/features/products/queries";

/** Product data for edit mode - form fields plus optional id for updates */
export type ProductFormInitialData = Partial<ProductFormData> & { id?: string };

interface ProductFormProps {
  initialData?: ProductFormInitialData;
  onSuccess: () => void;
  onCancel: () => void;
}

const VARIANT_EXAMPLES = [
  { name: "Color", values: ["Black", "Silver", "Alpine Blue", "Space Gray"] },
  { name: "Storage", values: ["128GB", "256GB", "512GB", "1TB"] },
  { name: "Size", values: ["Small", "Medium", "Large", "XL"] },
  { name: "Material", values: ["Titanium", "Aluminum", "Stainless Steel", "Ceramic"] },
];

export function ProductForm({
  initialData,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const [expandedVariants, setExpandedVariants] = useState<Set<number>>(new Set([0]));
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const isEditMode = !!initialData?.id;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: yupResolver(productSchema) as Resolver<ProductFormData>,
    defaultValues: initialData || {
      name: "",
      description: "",
      currency: "USD",
      isOnSale: false,
      categoryId: "",
      specs: {},
      variants: [
        {
          sku: "",
          price: 0,
          stock: 0,
          options: [],
        }
      ],
    },
  });

  // Cleanup blob URLs from form values before submission
  // This ensures we never send blob URLs to the backend
  const cleanupBlobUrls = useCallback((variants: ProductFormData["variants"]) => {
    return variants.map((variant) => {
      const cleanedVariant = { ...variant };

      // Remove blob URLs from image
      if (cleanedVariant.image && cleanedVariant.image.startsWith("blob:")) {
        cleanedVariant.image = undefined;
      }

      // Remove blob URLs from images array
      if (cleanedVariant.images && Array.isArray(cleanedVariant.images)) {
        cleanedVariant.images = cleanedVariant.images.filter(
          (img) => img && !img.startsWith("blob:")
        );
        if (cleanedVariant.images.length === 0) {
          cleanedVariant.images = undefined;
        }
      }

      return cleanedVariant;
    });
  }, []);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const nameValue = watch("name");
  useEffect(() => {
    if (!initialData && nameValue) {
      // Simple slug generation
      const slug = nameValue
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      // We don't have a slug field in ProductFormData schema yet,
      // but it's likely needed for the API.
      // For now we follow the schema provided.
    }
  }, [nameValue, initialData]);

  const toggleVariant = (index: number) => {
    const newExpanded = new Set(expandedVariants);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedVariants(newExpanded);
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      // Validate: Check for blob URLs before processing
      const hasBlobUrls = data.variants.some((variant) => {
        const hasBlobImage = variant.image && variant.image.startsWith("blob:");
        const hasBlobImages = variant.images && variant.images.some((img) => img && img.startsWith("blob:"));
        return hasBlobImage || hasBlobImages;
      });

      if (hasBlobUrls) {
        toast.error("Please wait for images to finish uploading before submitting. Blob URLs cannot be saved.");
        return;
      }

      // Clean up any blob URLs before processing (safety check)
      const cleanedVariants = cleanupBlobUrls(data.variants);

      // Transform variant options from array format to Record<string, string>
      const transformedVariants = cleanedVariants.map((variant) => {
        const optionsRecord: Record<string, string> = {};
        if (variant.options && Array.isArray(variant.options)) {
          variant.options.forEach((opt) => {
            if (opt.name && opt.value) {
              optionsRecord[opt.name] = opt.value;
            }
          });
        }

        const transformedVariant: {
          id?: string;
          sku: string;
          price: number;
          stock: number;
          image?: string;
          images?: string[];
          options?: Record<string, string>;
        } = {
          sku: variant.sku,
          price: variant.price,
          stock: variant.stock,
          // Filter out blob URLs - only use permanent URLs (UploadThing URLs)
          image: variant.image &&
                 variant.image.trim() !== "" &&
                 !variant.image.startsWith("blob:")
                 ? variant.image : undefined,
          images: variant.images && variant.images.length > 0
                 ? variant.images.filter((img): img is string =>
                     !!img &&
                     img.trim() !== "" &&
                     !img.startsWith("blob:")
                   )
                 : undefined,
          options: Object.keys(optionsRecord).length > 0 ? optionsRecord : undefined,
        };

        // Include variant ID when updating (backend needs it to identify existing variants)
        if (isEditMode && variant.id) {
          transformedVariant.id = variant.id;
        }

        return transformedVariant;
      });

      // Prepare the payload matching backend CreateProductDto
      const payload = {
        name: data.name,
        description: data.description, // Required field, validated by schema
        currency: data.currency || "USD",
        isOnSale: data.isOnSale || false,
        discountType: data.isOnSale ? (data.discountType || null) : null,
        discountValue: data.isOnSale && data.discountValue ? data.discountValue : null,
        saleStartsAt: data.saleStartsAt || null,
        saleEndsAt: data.saleEndsAt || null,
        categoryId: data.categoryId,
        isActive: true, // Default to active
        isFeatured: false, // Default to not featured
        // Only include specs if it has valid entries (non-empty keys and values)
        ...(data.specs && Object.keys(data.specs).length > 0
          ? (() => {
              const filteredSpecs = Object.fromEntries(
                Object.entries(data.specs).filter(
                  ([key, value]) =>
                    typeof key === "string" &&
                    typeof value === "string" &&
                    key.trim() !== "" &&
                    value.trim() !== ""
                )
              );
              // Only include specs if filtered object has entries
              return Object.keys(filteredSpecs).length > 0 ? { specs: filteredSpecs } : {};
            })()
          : {}),
        variants: transformedVariants,
      };

      if (isEditMode && initialData?.id) {
        // Update existing product
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: payload,
        });
      } else {
        // Create new product
        await createMutation.mutateAsync(payload);
      }
      onSuccess();
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  // Collect all validation errors for display
  const hasErrors = Object.keys(errors).length > 0;
  const errorMessages: string[] = [];

  if (errors.name) errorMessages.push(`Product Name: ${errors.name.message}`);
  if (errors.description) errorMessages.push(`Description: ${errors.description.message}`);
  if (errors.categoryId) errorMessages.push(`Category: ${errors.categoryId.message}`);
  if (errors.currency) errorMessages.push(`Currency: ${errors.currency.message}`);
  if (errors.variants) {
    if (Array.isArray(errors.variants)) {
      errors.variants.forEach((variantError: any, index: number) => {
        if (variantError) {
          if (variantError.sku) errorMessages.push(`Variant ${index + 1} - SKU: ${variantError.sku.message}`);
          if (variantError.price) errorMessages.push(`Variant ${index + 1} - Price: ${variantError.price.message}`);
          if (variantError.stock) errorMessages.push(`Variant ${index + 1} - Stock: ${variantError.stock.message}`);
          if (variantError.image) errorMessages.push(`Variant ${index + 1} - Image: ${variantError.image.message}`);
          if (variantError.images) errorMessages.push(`Variant ${index + 1} - Images: ${variantError.images.message}`);
        }
      });
    } else if (errors.variants.message) {
      errorMessages.push(`Variants: ${errors.variants.message}`);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">
      {/* Error Summary */}
      {(hasErrors || createMutation.isError) && (
        <Card className="p-4 border-red-200 bg-red-50 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <Text className="font-semibold text-red-900">Please fix the following errors:</Text>
              <ul className="list-disc list-inside space-y-1">
                {errorMessages.map((msg, idx) => (
                  <li key={idx} className="text-sm text-red-700">{msg}</li>
                ))}
                {createMutation.isError && (
                  <li className="text-sm text-red-700 font-medium">
                    {extractErrorMessage(createMutation.error, "Failed to create product. Please check all fields and try again.")}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
          <Card className="p-6 border-warm-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 mb-6 border-b border-warm-gray-100 pb-4">
              <Tag className="w-5 h-5 text-primary-500" />
              <Heading level="h3" className="text-lg">Product Information</Heading>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Input
                  label="Product Name *"
                  placeholder="e.g. iPhone 15 Pro Max"
                  {...register("name")}
                  error={!!errors.name}
                  className="h-11"
                />
                {errors.name && (
                  <Text className="text-xs text-red-600 mt-1">{errors.name.message}</Text>
                )}
              </div>

              <div className="space-y-2">
                <Textarea
                  label="Description"
                  placeholder="Describe your product in detail..."
                  rows={5}
                  {...register("description")}
                  error={errors.description?.message}
                  className="resize-none"
                />
              </div>

              {/* Specifications Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-warm-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-primary-500" />
                    <Text className="text-sm font-semibold text-warm-gray-800">Specifications</Text>
                    <Text className="text-xs text-warm-gray-400">(Optional)</Text>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px] font-bold uppercase tracking-wider text-primary-600 hover:bg-primary-50 px-2"
                    onClick={() => {
                      const currentSpecs = watch("specs") || {};
                      // Use a temporary unique key that will be replaced when user types
                      const tempKey = `__temp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
                      setValue("specs", { ...currentSpecs, [tempKey]: "" }, { shouldDirty: true });
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Spec
                  </Button>
                </div>

                <SpecsFields
                  control={control}
                  register={register}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Text className="text-sm font-medium text-warm-gray-700 block mb-1">
                    Category *
                  </Text>
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <CategoryPicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select category"
                        disabled={isSubmitting || createMutation.isPending}
                      />
                    )}
                  />
                  {errors.categoryId && (
                    <Text className="text-xs text-red-600 mt-1">{errors.categoryId.message}</Text>
                  )}
                </div>

                <div className="space-y-2">
                  <Input
                    label="Currency *"
                    {...register("currency")}
                    error={!!errors.currency}
                    className="h-11 font-mono uppercase"
                    placeholder="USD"
                  />
                  {errors.currency && (
                    <Text className="text-xs text-red-600 mt-1">{errors.currency.message}</Text>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Product Image - Syncs with first variant's main image */}
          <Card className="p-6 border-warm-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 mb-6 border-b border-warm-gray-100 pb-4">
              <ImageIcon className="w-5 h-5 text-primary-500" />
              <Heading level="h3" className="text-lg">Product Image</Heading>
              <Text className="text-xs text-warm-gray-500">(Required — used as main display image)</Text>
            </div>
            <Controller
              name="variants.0.image"
              control={control}
              render={({ field }) => (
                <ProductImageUploader
                  value={field.value ? [field.value] : []}
                  onChange={(urls) => field.onChange(urls[0])}
                  maxFiles={1}
                  label="Main product photo"
                  disabled={isSubmitting || createMutation.isPending}
                />
              )}
            />
            {errors.variants?.[0]?.image && (
              <Text className="text-xs text-red-600 mt-2">
                {errors.variants[0].image?.message}
              </Text>
            )}
            <p className="text-xs text-warm-gray-500 mt-3">
              This image will be used as the main product photo. Add more photos in the Variant Photos section below.
            </p>
          </Card>

          {/* Variants Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary-500" />
                <Heading level="h3" className="text-lg">Variants & Inventory</Heading>
                <HelpCircle className="w-4 h-4 text-warm-gray-400 cursor-help" />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  append({ sku: "", price: 0, stock: 0, options: [] });
                  setExpandedVariants(new Set([...expandedVariants, fields.length]));
                }}
                className="rounded-lg border-primary-200 text-primary-600 hover:bg-primary-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Variant
              </Button>
            </div>

            {errors.variants && !Array.isArray(errors.variants) && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{(errors.variants as any).message}</p>
              </div>
            )}

            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card
                  key={field.id}
                  className={cn(
                    "border-warm-gray-200 overflow-hidden transition-all duration-200",
                    expandedVariants.has(index) ? "shadow-md" : "hover:bg-warm-gray-50/50"
                  )}
                >
                  {/* Variant Header */}
                  <div
                    className={cn(
                      "p-4 flex items-center justify-between cursor-pointer",
                      expandedVariants.has(index) ? "bg-warm-gray-50/50 border-b border-warm-gray-100" : ""
                    )}
                    onClick={() => toggleVariant(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-warm-gray-100 flex items-center justify-center text-warm-gray-500 font-bold text-xs">
                        {index + 1}
                      </div>
                      <div>
                        <Text className="font-semibold text-warm-gray-900">
                          {watch(`variants.${index}.sku`) || "New Variant"}
                        </Text>
                        <div className="flex gap-2">
                          {watch(`variants.${index}.options`)?.map((opt: any, i: number) => (
                            <Badge key={i} variant="outline" className="text-[10px] py-0 h-4 bg-white">
                              {opt.name}: {opt.value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Text className="text-sm font-medium text-warm-gray-500 mr-4">
                        {watch(`variants.${index}.stock`)} in stock · {watch(`variants.${index}.price`)} {watch("currency")}
                      </Text>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            remove(index);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      {expandedVariants.has(index) ? <ChevronUp className="w-4 h-4 text-warm-gray-400" /> : <ChevronDown className="w-4 h-4 text-warm-gray-400" />}
                    </div>
                  </div>

                  {/* Variant Details */}
                  {expandedVariants.has(index) && (
                    <div className="p-6 space-y-8 animate-in slide-in-from-top-2 duration-200">
                      {/* SKU, Price, Stock */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Input
                            label="SKU *"
                            placeholder="e.g. IP15PM-BLK-256"
                            {...register(`variants.${index}.sku`)}
                            error={!!errors.variants?.[index]?.sku}
                            className="h-11"
                          />
                          {errors.variants?.[index]?.sku && (
                            <Text className="text-xs text-red-600 mt-1">
                              {errors.variants[index].sku?.message}
                            </Text>
                          )}
                        </div>
                        <div className="relative space-y-2">
                          <Input
                            label="Price *"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...register(`variants.${index}.price`)}
                            error={!!errors.variants?.[index]?.price}
                            className="h-11 pl-9"
                          />
                          <CircleDollarSign className="absolute left-3 top-[38px] w-4 h-4 text-warm-gray-400" />
                          {errors.variants?.[index]?.price && (
                            <Text className="text-xs text-red-600 mt-1 ml-9">
                              {errors.variants[index].price?.message}
                            </Text>
                          )}
                        </div>
                        <div className="relative space-y-2">
                          <Input
                            label="Stock *"
                            type="number"
                            placeholder="0"
                            {...register(`variants.${index}.stock`)}
                            error={!!errors.variants?.[index]?.stock}
                            className="h-11 pl-9"
                          />
                          <Package className="absolute left-3 top-[38px] w-4 h-4 text-warm-gray-400" />
                          {errors.variants?.[index]?.stock && (
                            <Text className="text-xs text-red-600 mt-1 ml-9">
                              {errors.variants[index].stock?.message}
                            </Text>
                          )}
                        </div>
                      </div>

                      {/* Variant Options */}
                      <VariantOptionsFields
                        index={index}
                        control={control}
                        register={register}
                        errors={errors}
                        watch={watch}
                        setValue={setValue}
                      />

                      {/* Variant Images */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-warm-gray-100 pb-2">
                          <ImageIcon className="w-4 h-4 text-primary-500" />
                          <Text className="text-sm font-semibold text-warm-gray-800">Variant Photos</Text>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <Text className="text-xs font-medium text-warm-gray-500 uppercase tracking-wider">Main Photo</Text>
                            <Controller
                              name={`variants.${index}.image`}
                              control={control}
                              render={({ field }) => (
                                <ProductImageUploader
                                  value={field.value ? [field.value] : []}
                                  onChange={(urls) => field.onChange(urls[0])}
                                  maxFiles={1}
                                  disabled={isSubmitting || createMutation.isPending}
                                />
                              )}
                            />
                            {errors.variants?.[index]?.image && (
                              <Text className="text-xs text-red-600 mt-1">
                                {errors.variants[index].image?.message}
                              </Text>
                            )}
                          </div>

                          <div className="space-y-3">
                            <Text className="text-xs font-medium text-warm-gray-500 uppercase tracking-wider">Photo Gallery</Text>
                            <Controller
                              name={`variants.${index}.images`}
                              control={control}
                              render={({ field }) => (
                                <ProductImageUploader
                                  value={(field.value || []).filter((v): v is string => v != null)}
                                  onChange={field.onChange}
                                  maxFiles={8}
                                  disabled={isSubmitting || createMutation.isPending}
                                />
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Status & Sidebar */}
        <div className="space-y-8">
          {/* Status Card */}
          <Card className="p-6 border-warm-gray-200 shadow-sm sticky top-8">
             <div className="flex items-center gap-2 mb-6 border-b border-warm-gray-100 pb-4">
              <Settings2 className="w-5 h-5 text-primary-500" />
              <Heading level="h3" className="text-lg">Publishing</Heading>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-3 rounded-lg bg-warm-gray-50 border border-warm-gray-100">
                <div className="flex flex-col">
                  <Text className="font-semibold text-warm-gray-900">Sale Status</Text>
                  <Text className="text-xs text-warm-gray-400">Put this product on sale</Text>
                </div>
                <Controller
                  name="isOnSale"
                  control={control}
                  render={({ field }) => (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={field.value}
                      onClick={() => field.onChange(!field.value)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                        field.value ? "bg-primary-600" : "bg-warm-gray-200"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          field.value ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  )}
                />
              </div>

              {watch("isOnSale") && (
                <div className="space-y-4 animate-in fade-in zoom-in duration-200">
                  <div className="space-y-2">
                    <Text className="text-xs font-medium text-warm-gray-500">Discount Type</Text>
                    <div className="grid grid-cols-2 gap-2">
                      {["PERCENTAGE", "FIXED_AMOUNT"].map((type) => (
                        <Button
                          key={type}
                          type="button"
                          variant={watch("discountType") === type ? "default" : "outline"}
                          className={cn(
                            "rounded-lg h-9 text-[10px] font-bold px-2",
                            watch("discountType") === type ? "bg-primary-600 border-primary-600" : "border-warm-gray-200"
                          )}
                          onClick={() => setValue("discountType", type as any)}
                        >
                          {type === "PERCENTAGE" ? "Percentage (%)" : "Fixed Amount ($)"}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Input
                    label="Discount Value"
                    type="number"
                    {...register("discountValue")}
                    error={!!errors.discountValue}
                    className="h-10"
                  />
                </div>
              )}

              <div className="pt-6 border-t border-warm-gray-100 space-y-3">
                <LoadingButton
                  type="submit"
                  loading={isSubmitting || createMutation.isPending}
                  loadingText={initialData ? "Updating Product..." : "Creating Product..."}
                  className="w-full rounded-lg h-11 bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {initialData ? "Update Product" : "Create Product"}
                </LoadingButton>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                  disabled={isSubmitting || createMutation.isPending}
                  className="w-full rounded-lg h-11 text-warm-gray-500"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}

function VariantOptionsFields({
  index,
  control,
  register,
  errors,
  watch,
  setValue
}: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variants.${index}.options`,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-warm-gray-100 pb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary-500" />
          <Text className="text-sm font-semibold text-warm-gray-800">Attribute Options</Text>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-[10px] font-bold uppercase tracking-wider text-primary-600 hover:bg-primary-50 px-2"
          onClick={() => append({ name: "", value: "" })}
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Option
        </Button>
      </div>

      {/* UX Examples */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Text className="text-[10px] text-warm-gray-400 w-full mb-1">Quick Suggestions:</Text>
        {VARIANT_EXAMPLES.map((example) => (
          <Button
            key={example.name}
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-[10px] rounded-lg px-3 py-0 border-warm-gray-200 hover:border-red-300 hover:bg-red-50/50 uppercase font-black tracking-widest"
            onClick={() => {
              const currentOptions = watch(`variants.${index}.options`) || [];
              if (!currentOptions.find((o: any) => o.name.toLowerCase() === example.name.toLowerCase())) {
                append({ name: example.name, value: "" });
              }
            }}
          >
            {example.name}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {fields.map((field, optIndex) => (
          <div key={field.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-200">
            <div className="flex-1 grid grid-cols-2 gap-3 p-3 bg-white rounded-lg border border-warm-gray-100 shadow-sm">
              <div className="space-y-1">
                <Text className="text-[10px] font-bold text-warm-gray-400 uppercase ml-1">Name</Text>
                <Input
                  placeholder="e.g. Color"
                  {...register(`variants.${index}.options.${optIndex}.name`)}
                  error={!!errors.variants?.[index]?.options?.[optIndex]?.name}
                  className="h-9 border-none bg-warm-gray-50/50 focus-visible:ring-1"
                />
              </div>
              <div className="space-y-1">
                <Text className="text-[10px] font-bold text-warm-gray-400 uppercase ml-1">Value</Text>
                <div className="relative group">
                  <Input
                    placeholder="e.g. Black"
                    {...register(`variants.${index}.options.${optIndex}.value`)}
                    error={!!errors.variants?.[index]?.options?.[optIndex]?.value}
                    className="h-9 border-none bg-warm-gray-50/50 focus-visible:ring-1"
                  />

                  {/* Suggestions dropdown based on name */}
                  {watch(`variants.${index}.options.${optIndex}.name`) && (
                    <VariantValueSuggestions
                      name={watch(`variants.${index}.options.${optIndex}.name`)}
                      onSelect={(v: string) => setValue(`variants.${index}.options.${optIndex}.value`, v)}
                    />
                  )}
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-6 h-8 w-8 p-0 text-warm-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full"
              onClick={() => remove(optIndex)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {fields.length === 0 && (
          <div className="py-4 text-center border-2 border-dashed border-warm-gray-100 rounded-lg bg-warm-gray-50/30">
            <Text className="text-xs text-warm-gray-400">No options added yet. (Optional)</Text>
          </div>
        )}
      </div>
    </div>
  );
}

function VariantValueSuggestions({ name, onSelect }: { name: string, onSelect: (v: string) => void }) {
  const example = VARIANT_EXAMPLES.find(ex => ex.name.toLowerCase() === name.toLowerCase());
  if (!example) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-white border border-warm-gray-100 rounded-lg shadow-xl z-10 hidden group-focus-within:block">
      <Text className="text-[10px] font-bold text-warm-gray-400 uppercase mb-2 px-1">Common Values</Text>
      <div className="flex flex-wrap gap-1">
        {example.values.map(val => (
          <button
            key={val}
            type="button"
            onClick={() => onSelect(val)}
            className="px-2 py-1 text-[10px] bg-warm-gray-50 hover:bg-primary-50 text-warm-gray-600 hover:text-primary-700 rounded-md transition-colors"
          >
            {val}
          </button>
        ))}
      </div>
    </div>
  );
}

function SpecsFields({
  control,
  register,
  errors,
  watch,
  setValue
}: {
  control: any;
  register: any;
  errors: any;
  watch: any;
  setValue: any;
}) {
  const specs = watch("specs") || {};

  // Use a ref to track stable IDs that don't change when keys update
  const idCounterRef = React.useRef(0);
  const keyToIdRef = React.useRef<Map<string, string>>(new Map());
  const idToKeyRef = React.useRef<Map<string, string>>(new Map());

  // Initialize mappings for existing specs
  React.useEffect(() => {
    const currentKeys = Object.keys(specs);
    const existingKeys = Array.from(keyToIdRef.current.keys());

    // Add mappings for new keys
    currentKeys.forEach(key => {
      if (!keyToIdRef.current.has(key)) {
        const id = `spec-${idCounterRef.current++}`;
        keyToIdRef.current.set(key, id);
        idToKeyRef.current.set(id, key);
      }
    });

    // Remove mappings for deleted keys
    existingKeys.forEach(key => {
      if (!currentKeys.includes(key)) {
        const id = keyToIdRef.current.get(key);
        if (id) {
          keyToIdRef.current.delete(key);
          idToKeyRef.current.delete(id);
        }
      }
    });
  }, [specs]);

  // Convert specs object to array with stable IDs
  const specEntries = useMemo(() => {
    return Object.entries(specs).map(([key, value]) => {
      let id = keyToIdRef.current.get(key);
      if (!id) {
        id = `spec-${idCounterRef.current++}`;
        keyToIdRef.current.set(key, id);
        idToKeyRef.current.set(id, key);
      }
      return {
        id,
        key,
        value: value as string,
      };
    });
  }, [specs]);

  const updateSpecKey = (id: string, newKey: string) => {
    const oldKey = idToKeyRef.current.get(id);
    if (!oldKey) return;

    const currentSpecs = { ...specs };
    const value = currentSpecs[oldKey] || "";

    // Remove old key
    delete currentSpecs[oldKey];
    keyToIdRef.current.delete(oldKey);

    // Add new key with same ID
    if (newKey.trim()) {
      currentSpecs[newKey] = value;
      keyToIdRef.current.set(newKey, id);
      idToKeyRef.current.set(id, newKey);
    } else {
      idToKeyRef.current.delete(id);
    }

    setValue("specs", currentSpecs, { shouldDirty: true });
  };

  const updateSpecValue = (id: string, newValue: string) => {
    const key = idToKeyRef.current.get(id);
    if (!key) return;

    const currentSpecs = { ...specs };
    currentSpecs[key] = newValue;
    setValue("specs", currentSpecs, { shouldDirty: true });
  };

  const removeSpec = (id: string) => {
    const key = idToKeyRef.current.get(id);
    if (!key) return;

    const currentSpecs = { ...specs };
    delete currentSpecs[key];
    keyToIdRef.current.delete(key);
    idToKeyRef.current.delete(id);
    setValue("specs", currentSpecs, { shouldDirty: true });
  };

  return (
    <div className="space-y-3">
      {specEntries.length === 0 ? (
        <div className="py-4 text-center border-2 border-dashed border-warm-gray-100 rounded-lg bg-warm-gray-50/30">
          <Text className="text-xs text-warm-gray-400">No specifications added yet. Click "Add Spec" to add product specifications.</Text>
        </div>
      ) : (
        specEntries.map((entry) => (
          <div key={entry.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-200">
            <div className="flex-1 grid grid-cols-2 gap-3 p-3 bg-white rounded-lg border border-warm-gray-100 shadow-sm">
              <div className="space-y-1">
                <Text className="text-[10px] font-bold text-warm-gray-400 uppercase ml-1">Spec Name</Text>
                <Input
                  placeholder="e.g. Weight, Dimensions, Material"
                  value={entry.key}
                  onChange={(e) => {
                    updateSpecKey(entry.id, e.target.value);
                  }}
                  className="h-9 border-none bg-warm-gray-50/50 focus-visible:ring-1"
                />
              </div>
              <div className="space-y-1">
                <Text className="text-[10px] font-bold text-warm-gray-400 uppercase ml-1">Value</Text>
                <Input
                  placeholder="e.g. 200g, 10x5x2cm, Aluminum"
                  value={entry.value}
                  onChange={(e) => {
                    updateSpecValue(entry.id, e.target.value);
                  }}
                  className="h-9 border-none bg-warm-gray-50/50 focus-visible:ring-1"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-6 h-8 w-8 p-0 text-warm-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full"
              onClick={() => removeSpec(entry.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
