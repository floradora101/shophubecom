/**
 * ContentTab Component
 *
 * Displays form fields for slide content including type, text, and CTA buttons.
 * Includes conditional type-specific fields.
 */

"use client";

import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Text } from "@/components/ui/typography";
import { FormSection } from "@/components/ui/form-section";
import { FormField } from "@/components/ui/form-field";
import { Stack } from "@/components/ui/stack";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryPicker } from "@/features/categories/components/category-picker";
import { ProductPicker } from "@/features/products/components/product-picker";
import { useQuery } from "@tanstack/react-query";
import { promotionsApi } from "@/features/promotions/api";
import type { UseFormReturn } from "react-hook-form";
import type { HeroSlideFormValues } from "@/lib/hero-slides/admin/form";

interface ContentTabProps {
  form: UseFormReturn<HeroSlideFormValues>;
}

export function ContentTab({ form }: ContentTabProps) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const formValues = watch();

  // Fetch promotions for the picker
  const { data: promotionsResponse, isLoading: isLoadingPromotions } = useQuery({
    queryKey: ["promotions"],
    queryFn: () => promotionsApi.getPromotions(),
    enabled: formValues.type === "PROMOTION",
  });

  const promotions = promotionsResponse || [];

  return (
    <div className="space-y-6">
      <FormSection
        title="Slide Type & Priority"
        description="Choose the type of slide and its display order."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Slide Type" error={errors.type?.message}>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRODUCT_SPOTLIGHT">
                      Product Spotlight
                    </SelectItem>
                    <SelectItem value="OFFER">Special Offer</SelectItem>
                    <SelectItem value="TESTIMONIAL">Testimonial</SelectItem>
                    <SelectItem value="LANDSCAPE_IMAGE">
                      Landscape Image
                    </SelectItem>
                    <SelectItem value="CATEGORY_SPOTLIGHT">
                      Category Spotlight
                    </SelectItem>
                    <SelectItem value="EDITORS_PICK">Editor&apos;s Pick</SelectItem>
                    <SelectItem value="COMPARISON_BATTLE">
                      Comparison Battle
                    </SelectItem>
                    <SelectItem value="PROMOTION">Promotion</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <Input
            label="Priority"
            type="number"
            placeholder="0"
            {...register("priority", { valueAsNumber: true })}
            error={!!errors.priority}
          />
        </div>
      </FormSection>

      <FormSection
        title="Text Content"
        description="Headlines and descriptions for the slide."
      >
        <Stack spacing="md">
          <Input
            label="Badge Text (Optional)"
            placeholder="e.g. New Collection, Mega Sale"
            {...register("badgeText")}
            error={!!errors.badgeText}
          />
          <div className={formValues.type === "COMPARISON_BATTLE" ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
            <Input
              label="Headline *"
              placeholder="Enter main headline"
              {...register("headline")}
              error={!!errors.headline}
            />
            {formValues.type !== "COMPARISON_BATTLE" && (
              <Input
                label="Highlight Text"
                placeholder="e.g. Redefined, 50% Off"
                {...register("highlight")}
                error={!!errors.highlight}
              />
            )}
          </div>
          <Textarea
            label="Description *"
            placeholder="Describe the promotion or product..."
            rows={3}
            {...register("description")}
            error={errors.description?.message}
          />
        </Stack>
      </FormSection>

      {(formValues.type === "PRODUCT_SPOTLIGHT" ||
        formValues.type === "CATEGORY_SPOTLIGHT" ||
        formValues.type === "EDITORS_PICK" ||
        formValues.type === "OFFER" ||
        formValues.type === "TESTIMONIAL" ||
        formValues.type === "COMPARISON_BATTLE" ||
        formValues.type === "PROMOTION") && (
        <FormSection
          title="Type-Specific Details"
          description="Additional fields required for this specific slide type."
        >
          <Stack spacing="md">
            {formValues.type === "PRODUCT_SPOTLIGHT" && (
              <FormField
                label="Target Product *"
                error={errors.mediaProductSlug?.message}
              >
                <Controller
                  name="mediaProductSlug"
                  control={control}
                  render={({ field }) => (
                    <ProductPicker
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        // Auto-fill fields if empty
                        if (val) {
                          setValue("mediaKind", "product");
                          if (!watch("ctaPrimaryLabel")) {
                            setValue("ctaPrimaryLabel", "Shop Now");
                          }
                        }
                      }}
                    />
                  )}
                />
              </FormField>
            )}

            {formValues.type === "COMPARISON_BATTLE" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Left Product *"
                    error={errors.leftProductSlug?.message}
                  >
                    <Controller
                      name="leftProductSlug"
                      control={control}
                      render={({ field }) => (
                        <ProductPicker
                          value={field.value}
                          onChange={(val) => field.onChange(val)}
                          placeholder="Select left product"
                        />
                      )}
                    />
                  </FormField>
                  <FormField
                    label="Right Product *"
                    error={errors.rightProductSlug?.message}
                  >
                    <Controller
                      name="rightProductSlug"
                      control={control}
                      render={({ field }) => (
                        <ProductPicker
                          value={field.value}
                          onChange={(val) => field.onChange(val)}
                          placeholder="Select right product"
                        />
                      )}
                    />
                  </FormField>
                </div>
                <Textarea
                  label="Comparison Points"
                  placeholder="e.g. Battery Life|Up to 20h|Up to 15h, Screen Size|6.7 inch|6.1 inch (label|left|right, comma separated)"
                  rows={3}
                  {...register("comparisonPoints")}
                  error={errors.comparisonPoints?.message}
                />
              </>
            )}

            {formValues.type === "CATEGORY_SPOTLIGHT" && (
              <>
                <FormField
                  label="Category *"
                  error={errors.categorySlug?.message}
                >
                  <Controller
                    name="categorySlug"
                    control={control}
                    render={({ field }) => (
                      <CategoryPicker
                        value={field.value}
                        valueField="slug"
                        onChange={(val) => {
                          field.onChange(val);
                          // Auto-fill fields if empty
                          if (val) {
                            if (!watch("ctaPrimaryLabel")) {
                              setValue("ctaPrimaryLabel", "Explore Category");
                            }
                          }
                        }}
                        placeholder="Select target category"
                      />
                    )}
                  />
                </FormField>
                <div className="space-y-3">
                  <Text variant="caption" className="font-semibold text-gray-700">
                    Category Highlights (Optional - Up to 3)
                  </Text>
                  {[0, 1, 2].map((index) => (
                    <Controller
                      key={index}
                      name={`categoryBullets.${index}`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          placeholder={`Highlight ${index + 1} (e.g., Premium Selection, Top Rated)`}
                          {...field}
                          error={!!(
                            errors.categoryBullets?.[index]?.message ||
                            (errors.categoryBullets?.message && index === 0 ? errors.categoryBullets.message : undefined)
                          )}
                        />
                      )}
                    />
                  ))}
                  <Text variant="caption" className="text-gray-500">
                    These will appear as bullet points in the slide preview
                  </Text>
                </div>
              </>
            )}

            {formValues.type === "EDITORS_PICK" && (
              <>
                <Textarea
                  label="Editor's Note (Optional)"
                  placeholder="Why did you pick these products?"
                  rows={2}
                  {...register("editorNote")}
                  error={errors.editorNote?.message}
                />
                <FormField
                  label="Selected Products (Max 4) *"
                  error={errors.productSlugs?.message}
                >
                  <Controller
                    name="productSlugs"
                    control={control}
                    render={({ field }) => (
                      <ProductPicker
                        multiple
                        value={
                          field.value
                            ? field.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean)
                            : []
                        }
                        onChange={(val) => {
                          if (Array.isArray(val)) {
                            // Limit to 4
                            const limited = val.slice(0, 4);
                            field.onChange(limited.join(", "));
                          } else {
                            field.onChange(val || "");
                          }
                        }}
                        placeholder="Search and add products..."
                      />
                    )}
                  />
                </FormField>
              </>
            )}

            {formValues.type === "OFFER" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Offer Label *"
                    placeholder="e.g. UP TO 50% OFF"
                    {...register("offerLabel")}
                    error={!!errors.offerLabel}
                  />
                  <Input
                    label="Promo Code"
                    placeholder="e.g. SAVE50"
                    {...register("promoCode")}
                    error={!!errors.promoCode}
                  />
                </div>
                <Input
                  label="Offer Ends At *"
                  type="datetime-local"
                  {...register("offerEndsAt")}
                  error={!!errors.offerEndsAt}
                />
              </div>
            )}

            {formValues.type === "TESTIMONIAL" && (
              <>
                <Textarea
                  label="Quote *"
                  placeholder="What the customer said..."
                  rows={2}
                  {...register("quote")}
                  error={errors.quote?.message}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Author Name *"
                    placeholder="John Doe"
                    {...register("authorName")}
                    error={!!errors.authorName}
                  />
                  <Input
                    label="Rating (1-5)"
                    type="number"
                    min={1}
                    max={5}
                    {...register("rating", { valueAsNumber: true })}
                    error={!!errors.rating}
                  />
                </div>
              </>
            )}
            {formValues.type === "PROMOTION" && (
              <>
                <FormField
                  label="Link to Promotion *"
                  error={errors.promotionId?.message}
                >
                  <Controller
                    name="promotionId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingPromotions ? "Loading promotions..." : "Select promotion"} />
                        </SelectTrigger>
                        <SelectContent>
                          {promotions.map((promo: any) => (
                            <SelectItem key={promo.id} value={promo.id}>
                              {promo.name} ({promo.type === 'PERCENTAGE' ? `${promo.value}%` : `$${promo.value}`})
                            </SelectItem>
                          ))}
                          {promotions.length === 0 && !isLoadingPromotions && (
                            <SelectItem value="none" disabled>No promotions found</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Background Color (Hex)"
                    placeholder="#f3f4f6"
                    {...register("promotionBgColor")}
                    error={!!errors.promotionBgColor}
                  />
                  <Input
                    label="Text Color (Hex)"
                    placeholder="#111827"
                    {...register("promotionTextColor")}
                    error={!!errors.promotionTextColor}
                  />
                </div>
              </>
            )}
          </Stack>
        </FormSection>
      )}

      <FormSection
        title="Action Button (CTA)"
        description={
          formValues.type === "COMPARISON_BATTLE"
            ? "This label will appear on both product buttons with 'A' and 'B' suffixes."
            : "The primary call-to-action button for the slide."
        }
      >
        <div className="space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/10 max-w-md">
          <Text variant="caption" className="font-bold text-primary">
            Primary Button
          </Text>
          <Input
            label="Label *"
            placeholder="e.g. Shop Now"
            {...register("ctaPrimaryLabel")}
            error={!!errors.ctaPrimaryLabel}
          />
          {formValues.type === "COMPARISON_BATTLE" && (
            <Text variant="caption" className="text-gray-500 italic">
              Left button: "{watch("ctaPrimaryLabel") || "Label"} A" | Right button: "{watch("ctaPrimaryLabel") || "Label"} B"
            </Text>
          )}
        </div>
      </FormSection>
    </div>
  );
}
