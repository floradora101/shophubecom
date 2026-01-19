/**
 * MediaTab Component
 *
 * Displays form fields for slide media upload and configuration.
 */

"use client";

import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
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
import { CategoryImageUploader } from "@/features/categories/components/category-image-uploader";
import type { UseFormReturn } from "react-hook-form";
import type { HeroSlideFormValues } from "@/lib/hero-slides/admin/form";

interface MediaTabProps {
  form: UseFormReturn<HeroSlideFormValues>;
}

export function MediaTab({ form }: MediaTabProps) {
  const {
    register,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const formValues = watch();

  return (
    <div className="space-y-6">
      <FormSection
        title="Media Source"
        description="Choose what to display as the main visual."
      >
        <Stack spacing="lg">
          <FormField label="Media Kind" error={errors.mediaKind?.message}>
            <Controller
              name="mediaKind"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select media kind" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">Product Model</SelectItem>
                    <SelectItem value="image">Custom Image</SelectItem>
                    <SelectItem value="video">Video Loop</SelectItem>
                    <SelectItem value="none">No Media (Text Only)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          {formValues.mediaKind === "product" && (
            <Input
              label="Product Slug *"
              placeholder="e.g. iphone-15-pro"
              {...register("mediaProductSlug")}
              error={!!errors.mediaProductSlug}
            />
          )}

          {(formValues.mediaKind === "image" ||
            formValues.mediaKind === "video") && (
            <div className="space-y-3">
              <Text className="text-sm font-medium text-warm-gray-700 block">
                {formValues.mediaKind === "image"
                  ? "Slide Image"
                  : "Slide Video URL"}
              </Text>
              {formValues.mediaKind === "image" ? (
                <Controller
                  name="mediaImageUrl"
                  control={control}
                  render={({ field }) => (
                    <CategoryImageUploader
                      value={field.value || undefined}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  )}
                />
              ) : (
                <Input
                  placeholder="https://video-url.mp4"
                  {...register("mediaImageUrl")}
                  error={!!errors.mediaImageUrl}
                />
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Alt Text"
              placeholder="Describe the image for accessibility"
              {...register("mediaAlt")}
              error={!!errors.mediaAlt}
            />
            <FormField label="Media Focus Position">
              <Controller
                name="mediaPosition"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Center" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>
        </Stack>
      </FormSection>
    </div>
  );
}
