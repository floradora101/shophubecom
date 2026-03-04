/**
 * MediaTab Component
 *
 * Displays form fields for slide media upload and configuration.
 */

"use client";

import React from "react";
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
import { ProductImageUploader } from "@/features/products/components/product-image-uploader";
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
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const formValues = watch();
  const isLandscapeImage = formValues.type === "LANDSCAPE_IMAGE";
  const isOffer = formValues.type === "OFFER";
  const isTestimonial = formValues.type === "TESTIMONIAL";
  const requiresImageOnly = isLandscapeImage || isOffer || isTestimonial;

  // Force media kind to "image" for LANDSCAPE_IMAGE, OFFER, and TESTIMONIAL types
  React.useEffect(() => {
    if (requiresImageOnly && formValues.mediaKind !== "image") {
      setValue("mediaKind", "image");
    }
  }, [requiresImageOnly, formValues.mediaKind, setValue]);

  return (
    <div className="space-y-6">
      <FormSection
        title="Media Source"
        description={
          isLandscapeImage
            ? "Landscape slides require an image."
            : isOffer
            ? "Offer slides require an image."
            : isTestimonial
            ? "Testimonial slides require an image."
            : "Choose what to display as the main visual."
        }
      >
        <Stack spacing="lg">
          {!requiresImageOnly && (
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
          )}

          {requiresImageOnly && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Text className="text-sm text-blue-800">
                {isLandscapeImage
                  ? "Landscape slides use images only. Upload your image below."
                  : isOffer
                  ? "Offer slides use images only. Upload your image below."
                  : "Testimonial slides use images only. Upload your image below."}
              </Text>
            </div>
          )}

          {!requiresImageOnly && formValues.mediaKind === "product" && (
            <Input
              label="Product Slug *"
              placeholder="e.g. iphone-15-pro"
              {...register("mediaProductSlug")}
              error={!!errors.mediaProductSlug}
            />
          )}

          {(requiresImageOnly ||
            formValues.mediaKind === "image" ||
            formValues.mediaKind === "video") && (
            <div className="space-y-3">
              <Text className="text-sm font-medium text-warm-gray-700 block">
                {requiresImageOnly || formValues.mediaKind === "image"
                  ? "Slide Image"
                  : "Slide Video URL"}
              </Text>
              {(requiresImageOnly || formValues.mediaKind === "image") ? (
                <Controller
                  name="mediaImageUrl"
                  control={control}
                  render={({ field }) => (
                    <ProductImageUploader
                      value={field.value && field.value.trim() ? [field.value] : []}
                      onChange={(urls) => {
                        // ProductImageUploader returns an array, but we need a single URL
                        // Take the first URL or undefined
                        const url = urls && urls.length > 0 ? urls[0] : undefined;
                        // Filter out blob URLs and empty strings
                        const cleanUrl = url && !url.startsWith("blob:") && url.trim() ? url.trim() : "";
                        // Use empty string instead of undefined to match form schema
                        field.onChange(cleanUrl || "");
                      }}
                      maxFiles={1}
                      label="Slide Image"
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
