"use client";

import React, { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HeroSlideFormSchema,
  type HeroSlideFormValues,
  getDefaultHeroSlideFormValues,
  fromFormValues,
  toFormValues
} from "@/lib/hero-slides/admin/form";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Stack } from "@/components/ui/stack";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/typography";
import { toast } from "sonner";
import { Loader2, Type, ImageIcon, Sparkles, Settings2, Layout } from "lucide-react";
import { HeroSlidePreview } from "./HeroSlidePreview";
import { FormSection } from "@/components/ui/form-section";
import { FormField } from "@/components/ui/form-field";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { CategoryImageUploader } from "@/features/categories/components/category-image-uploader";

interface HeroSlideFormProps {
  slide?: HeroSlide;
  onSuccess: () => void;
  onCancel: () => void;
}

export function HeroSlideForm({
  slide,
  onSuccess,
  onCancel,
}: HeroSlideFormProps) {
  const initialValues = useMemo(() => {
    if (slide) {
      return toFormValues(slide);
    }
    return getDefaultHeroSlideFormValues();
  }, [slide]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<HeroSlideFormValues>({
    resolver: zodResolver(HeroSlideFormSchema),
    defaultValues: initialValues,
  });

  const formValues = watch();

  // Create a live slide object for preview
  const previewSlide = useMemo(() => {
    try {
      return fromFormValues(formValues, slide?.id);
    } catch (e) {
      // If validation fails during real-time mapping, return current or default
      return slide || fromFormValues(getDefaultHeroSlideFormValues());
    }
  }, [formValues, slide]);

  const onSubmit = async (values: HeroSlideFormValues) => {
    try {
      const data = fromFormValues(values, slide?.id);
      console.log("Submitting hero slide data:", data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(
        slide
          ? "Hero slide updated successfully!"
          : "Hero slide created successfully!"
      );
      onSuccess();
    } catch (error) {
      console.error("Failed to save hero slide:", error);
      toast.error("Failed to save hero slide. Please check the form for errors.");
    }
  };

  const formTabs: TabItem[] = useMemo(() => [
    {
      id: "content",
      label: "Content",
      icon: <Type className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <FormSection title="Slide Type & Priority" description="Choose the type of slide and its display order.">
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
                        <SelectItem value="PRODUCT_SPOTLIGHT">Product Spotlight</SelectItem>
                        <SelectItem value="CATEGORY_SPOTLIGHT">Category Spotlight</SelectItem>
                        <SelectItem value="OFFER">Special Offer</SelectItem>
                        <SelectItem value="TESTIMONIAL">Testimonial</SelectItem>
                        <SelectItem value="LANDSCAPE_IMAGE">Landscape Image</SelectItem>
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
                error={errors.priority?.message}
              />
            </div>
          </FormSection>

          <FormSection title="Text Content" description="Headlines and descriptions for the slide.">
            <Stack spacing="md">
              <Input
                label="Badge Text (Optional)"
                placeholder="e.g. New Collection, Mega Sale"
                {...register("badgeText")}
                error={errors.badgeText?.message}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Headline *"
                  placeholder="Enter main headline"
                  {...register("headline")}
                  error={errors.headline?.message}
                />
                <Input
                  label="Highlight Text"
                  placeholder="e.g. Redefined, 50% Off"
                  {...register("highlight")}
                  error={errors.highlight?.message}
                />
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

          <FormSection title="Actions (CTA)" description="Primary and secondary buttons for the slide.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                <Text variant="small" className="font-bold text-primary">Primary Button</Text>
                <Input
                  label="Label *"
                  placeholder="e.g. Shop Now"
                  {...register("ctaPrimaryLabel")}
                  error={errors.ctaPrimaryLabel?.message}
                />
                <Input
                  label="Link (URL) *"
                  placeholder="e.g. /products/..."
                  {...register("ctaPrimaryHref")}
                  error={errors.ctaPrimaryHref?.message}
                />
              </div>
              <div className="space-y-4 p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                <Text variant="small" className="font-bold text-neutral-600">Secondary Button</Text>
                <Input
                  label="Label"
                  placeholder="e.g. Learn More"
                  {...register("ctaSecondaryLabel")}
                  error={errors.ctaSecondaryLabel?.message}
                />
                <Input
                  label="Link (URL)"
                  placeholder="e.g. /about"
                  {...register("ctaSecondaryHref")}
                  error={errors.ctaSecondaryHref?.message}
                />
              </div>
            </div>
          </FormSection>
        </div>
      )
    },
    {
      id: "media",
      label: "Media",
      icon: <ImageIcon className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <FormSection title="Media Source" description="Choose what to display as the main visual.">
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
                  error={errors.mediaProductSlug?.message}
                />
              )}

              {(formValues.mediaKind === "image" || formValues.mediaKind === "video") && (
                <div className="space-y-3">
                  <Text className="text-sm font-medium text-warm-gray-700 block">
                    {formValues.mediaKind === "image" ? "Slide Image" : "Slide Video URL"}
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
                      error={errors.mediaImageUrl?.message}
                    />
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Alt Text"
                  placeholder="Describe the image for accessibility"
                  {...register("mediaAlt")}
                  error={errors.mediaAlt?.message}
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
      )
    },
    {
      id: "style",
      label: "Style",
      icon: <Sparkles className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          {formValues.type === "LANDSCAPE_IMAGE" ? (
            <>
              <FormSection title="Landscape Typography" description="Special styling for landscape hero slides.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Visual Variant">
                    <Controller
                      name="landscapeVariant"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minimal">Minimal (Clean)</SelectItem>
                            <SelectItem value="glass">Glass (Blurred)</SelectItem>
                            <SelectItem value="editorial">Editorial (Bold)</SelectItem>
                            <SelectItem value="neon">Neon (Vibrant)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>
                  <FormField label="Headline Decoration">
                    <Controller
                      name="landscapeHeadlineDecoration"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="underline">Underline</SelectItem>
                            <SelectItem value="doubleUnderline">Double Underline</SelectItem>
                            <SelectItem value="wavyUnderline">Wavy Underline</SelectItem>
                            <SelectItem value="gradient">Gradient Text</SelectItem>
                            <SelectItem value="glow">Soft Glow</SelectItem>
                            <SelectItem value="redNeonGlow">Red Neon Glow</SelectItem>
                            <SelectItem value="outline">Outline</SelectItem>
                            <SelectItem value="outlineFill">Outline Fill</SelectItem>
                            <SelectItem value="boxed">Boxed</SelectItem>
                            <SelectItem value="metallic">Metallic</SelectItem>
                            <SelectItem value="chrome">Chrome</SelectItem>
                            <SelectItem value="platinum">Platinum</SelectItem>
                            <SelectItem value="glitch">Glitch</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>
                  <FormField label="Highlight Effect">
                    <Controller
                      name="landscapeHighlightEffect"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="underlineGlow">Underline Glow</SelectItem>
                            <SelectItem value="pulse">Pulse</SelectItem>
                            <SelectItem value="shimmer">Shimmer</SelectItem>
                            <SelectItem value="bounce">Bounce</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>
                </div>
              </FormSection>

              <FormSection title="Layout & Overlay" description="Positioning and background control.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Content Placement">
                    <Controller
                      name="landscapePlacement"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Left Aligned</SelectItem>
                            <SelectItem value="center">Centered</SelectItem>
                            <SelectItem value="right">Right Aligned</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>
                  <div className="space-y-2">
                    <Text variant="small" className="font-medium">Overlay Opacity ({Math.round(formValues.overlayOpacity * 100)}%)</Text>
                    <Controller
                      name="overlayOpacity"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={field.value}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      )}
                    />
                  </div>
                </div>
              </FormSection>
            </>
          )}
        </div>
      )
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings2 className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <FormSection title="Visibility & Schedule" description="Control when this slide is visible to users.">
            <Stack spacing="lg">
              <div className="flex items-center space-x-2 p-4 rounded-lg border border-neutral-200 bg-neutral-50/50">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="w-5 h-5"
                    />
                  )}
                />
                <label htmlFor="isActive" className="text-sm font-semibold cursor-pointer">
                  Slide is Active
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Date (Optional)"
                  type="datetime-local"
                  {...register("startsAt")}
                  error={errors.startsAt?.message}
                />
                <Input
                  label="End Date (Optional)"
                  type="datetime-local"
                  {...register("endsAt")}
                  error={errors.endsAt?.message}
                />
              </div>
            </Stack>
          </FormSection>
        </div>
      )
    }
  ], [errors, control, register, formValues, isSubmitting]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar: Form Controls */}
      <div className="lg:col-span-7 space-y-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <Tabs
            tabs={formTabs}
            defaultTab="content"
            className="w-full"
            variant="default"
            size="md"
          />

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-neutral-100 mt-8">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-lg px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg px-8 min-w-[140px] shadow-md hover:shadow-lg transition-all duration-200 bg-primary-600 hover:bg-primary-700 h-12"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving Slide...
                </>
              ) : (
                <>
                  {slide ? "Update Slide" : "Create Slide"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Preview Column */}
      <div className="lg:col-span-5">
        <div className="sticky top-24 space-y-6">
          <HeroSlidePreview slide={previewSlide} />

          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Layout className="w-5 h-5" />
              </div>
              <Text variant="h4">Admin Tip</Text>
            </div>
            <Text variant="small" className="text-neutral-600 leading-relaxed">
              Use <strong>Landscape Image</strong> slides for full-width high-impact visuals.
              <strong>Product Spotlight</strong> works best for single item promotions with standard themes.
              Slides with higher priority (e.g., 100) will appear first in the carousel.
            </Text>
          </Card>
        </div>
      </div>
    </div>
  );
}
