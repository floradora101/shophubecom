"use client";

import { UseFormReturn } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SelectWithOptions as Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { FormSection } from "@/components/ui/form-section";
import { Text } from "@/components/ui/typography";
import { HeroSlideFormValues } from "@/lib/hero-slides/admin/form";

interface HeroSlideFormProps {
  form: UseFormReturn<HeroSlideFormValues>;
}

export function HeroSlideForm({ form }: HeroSlideFormProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const slideType = watch("type");
  const mediaKind = watch("mediaKind");

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <Card padding="lg">
        <FormSection title="Basic Settings">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Slide Type" error={errors.type?.message}>
              <Select
                value={slideType}
                onValueChange={(value) =>
                  setValue("type", value as HeroSlideFormValues["type"])
                }
                options={[
                  { value: "PRODUCT_SPOTLIGHT", label: "Product Spotlight" },
                  { value: "CATEGORY_SPOTLIGHT", label: "Category Spotlight" },
                  { value: "OFFER", label: "Offer" },
                  { value: "TESTIMONIAL", label: "Testimonial" },
                  { value: "LANDSCAPE_IMAGE", label: "Landscape Image" },
                ]}
              />
            </FormField>

            <FormField label="Priority" error={errors.priority?.message}>
              <Input
                type="number"
                {...register("priority", { valueAsNumber: true })}
                placeholder="0"
              />
              <p className="text-xs text-warm-gray-500 mt-1">
                Higher numbers appear first
              </p>
            </FormField>
          </div>

          <FormField label="">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={watch("isActive")}
                onChange={(e) => setValue("isActive", e.target.checked)}
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-warm-gray-700"
              >
                Active (visible on homepage)
              </label>
            </div>
          </FormField>
        </FormSection>
      </Card>

      {/* Scheduling */}
      <Card padding="lg">
        <FormSection title="Scheduling">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Start Date/Time" error={errors.startsAt?.message}>
              <Input type="datetime-local" {...register("startsAt")} />
              <p className="text-xs text-warm-gray-500 mt-1">
                Optional. Leave empty for immediate activation.
              </p>
            </FormField>

            <FormField label="End Date/Time" error={errors.endsAt?.message}>
              <Input type="datetime-local" {...register("endsAt")} />
              <p className="text-xs text-warm-gray-500 mt-1">
                Optional. Leave empty for no expiration.
              </p>
            </FormField>
          </div>
        </FormSection>
      </Card>

      {/* Content */}
      <Card padding="lg">
        <FormSection title="Content">
          <FormField label="Badge Text" error={errors.badgeText?.message}>
            <Input
              {...register("badgeText")}
              placeholder="NEW • LIMITED TIME"
              maxLength={30}
            />
            <p className="text-xs text-warm-gray-500 mt-1">
              Optional badge above headline (max 30 chars)
            </p>
          </FormField>

          <FormField label="Headline" error={errors.headline?.message}>
            <Input
              {...register("headline")}
              placeholder="Amazing Product Headline"
              maxLength={80}
            />
            <p className="text-xs text-warm-gray-500 mt-1">
              Main headline (max 80 chars)
            </p>
          </FormField>

          <FormField label="Highlight" error={errors.highlight?.message}>
            <Input
              {...register("highlight")}
              placeholder="Special highlight text"
              maxLength={60}
            />
            <p className="text-xs text-warm-gray-500 mt-1">
              Optional secondary highlight (max 60 chars)
            </p>
          </FormField>

          <FormField label="Description" error={errors.description?.message}>
            <Textarea
              {...register("description")}
              placeholder="Describe the slide content..."
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-warm-gray-500 mt-1">
              Description text (max 200 chars)
            </p>
          </FormField>
        </FormSection>
      </Card>

      {/* Call to Actions */}
      <Card padding="lg">
        <FormSection title="Call to Actions">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Text className="font-medium text-warm-gray-900">
                Primary CTA
              </Text>
              <FormField label="Label" error={errors.ctaPrimaryLabel?.message}>
                <Input
                  {...register("ctaPrimaryLabel")}
                  placeholder="Shop Now"
                  maxLength={20}
                />
              </FormField>
              <FormField label="URL" error={errors.ctaPrimaryHref?.message}>
                <Input
                  {...register("ctaPrimaryHref")}
                  placeholder="https://example.com"
                />
              </FormField>
            </div>

            <div className="space-y-4">
              <Text className="font-medium text-warm-gray-900">
                Secondary CTA (Optional)
              </Text>
              <FormField
                label="Label"
                error={errors.ctaSecondaryLabel?.message}
              >
                <Input
                  {...register("ctaSecondaryLabel")}
                  placeholder="Learn More"
                  maxLength={20}
                />
              </FormField>
              <FormField label="URL" error={errors.ctaSecondaryHref?.message}>
                <Input
                  {...register("ctaSecondaryHref")}
                  placeholder="https://example.com"
                />
              </FormField>
            </div>
          </div>
        </FormSection>
      </Card>

      {/* Media */}
      <Card padding="lg">
        <FormSection title="Media">
          <FormField label="Media Type" error={errors.mediaKind?.message}>
            <Select
              value={mediaKind}
              onValueChange={(value) =>
                setValue("mediaKind", value as HeroSlideFormValues["mediaKind"])
              }
              options={[
                { value: "none", label: "No Media" },
                { value: "image", label: "Image" },
                { value: "product", label: "Product Image" },
              ]}
            />
          </FormField>

          {mediaKind === "image" && (
            <FormField label="Image URL" error={errors.mediaImageUrl?.message}>
              <Input
                {...register("mediaImageUrl")}
                placeholder="https://example.com/image.jpg"
              />
            </FormField>
          )}

          {mediaKind === "product" && (
            <FormField
              label="Product Slug"
              error={errors.mediaProductSlug?.message}
            >
              <Input
                {...register("mediaProductSlug")}
                placeholder="product-slug"
              />
              <p className="text-xs text-warm-gray-500 mt-1">
                The slug of the product to display
              </p>
            </FormField>
          )}

          {(mediaKind === "image" || mediaKind === "product") && (
            <>
              <FormField label="Alt Text" error={errors.mediaAlt?.message}>
                <Input
                  {...register("mediaAlt")}
                  placeholder="Describe the image"
                  maxLength={200}
                />
              </FormField>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="Position"
                  error={errors.mediaPosition?.message}
                >
                  <Select
                    value={watch("mediaPosition") || "center"}
                    onValueChange={(value) =>
                      setValue("mediaPosition", value as any)
                    }
                    options={[
                      { value: "center", label: "Center" },
                      { value: "top", label: "Top" },
                      { value: "bottom", label: "Bottom" },
                      { value: "left", label: "Left" },
                      { value: "Right", label: "Right" },
                    ]}
                  />
                </FormField>

                <FormField
                  label="Aspect Ratio"
                  error={errors.mediaAspect?.message}
                >
                  <Select
                    value={watch("mediaAspect") || "default"}
                    onValueChange={(value) =>
                      setValue("mediaAspect", value as any)
                    }
                    options={[
                      { value: "default", label: "Default" },
                      { value: "landscape", label: "Landscape" },
                    ]}
                  />
                </FormField>
              </div>
            </>
          )}
        </FormSection>
      </Card>

      {/* Theme */}
      <Card padding="lg">
        <FormSection title="Theme">
          <FormField
            label="Accent Theme"
            error={errors.themeAccentToken?.message}
          >
            <Select
              value={watch("themeAccentToken")}
              onValueChange={(value) =>
                setValue("themeAccentToken", value as any)
              }
              options={[
                { value: "red-black", label: "Red & Black" },
                { value: "red-blue", label: "Red & Blue" },
                { value: "red-pink", label: "Red & Pink" },
                { value: "red-gray", label: "Red & Gray" },
                { value: "red-burgundy", label: "Red & Burgundy" },
                { value: "blue-green", label: "Blue & Green" },
                { value: "red-orange", label: "Red & Orange" },
              ]}
            />
          </FormField>
        </FormSection>
      </Card>

      {/* Type-specific fields would go here - simplified for now */}
    </div>
  );
}
