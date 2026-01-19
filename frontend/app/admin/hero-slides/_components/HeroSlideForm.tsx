"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text, Heading } from "@/components/ui/typography";
import { Loader2, Layout } from "lucide-react";
import { HeroSlidePreview } from "./HeroSlidePreview";
import { Tabs } from "@/components/ui/tabs";
import { useHeroSlideForm } from "./hooks/useHeroSlideForm";
import { useHeroSlidePreview } from "./hooks/useHeroSlidePreview";
import { useHeroSlideSubmission } from "./hooks/useHeroSlideSubmission";
import { useHeroSlideTabs } from "./hooks/useHeroSlideTabs";
import type { HeroSlide } from "@/lib/types/heroSlides.types";

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
  // Extract form logic to custom hooks
  const { form, formValues } = useHeroSlideForm({ slide });
  const { handleSubmit, formState } = form;
  const { isSubmitting } = formState;

  // Extract preview generation to custom hook
  const previewSlide = useHeroSlidePreview({ formValues, slide });

  // Extract submission logic to custom hook
  const { onSubmit } = useHeroSlideSubmission({ slide, onSuccess });

  // Extract tab configuration to custom hook
  const formTabs = useHeroSlideTabs({ form, formValues });

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
                <>{slide ? "Update Slide" : "Create Slide"}</>
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
              <Heading level="h4">Admin Tip</Heading>
            </div>
            <Text
              variant="caption"
              className="text-neutral-600 leading-relaxed"
            >
              Use <strong>Landscape Image</strong> slides for full-width
              high-impact visuals.
              <strong>Product Spotlight</strong> works best for single item
              promotions with standard themes. Slides with higher priority
              (e.g., 100) will appear first in the carousel.
            </Text>
          </Card>
        </div>
      </div>
    </div>
  );
}
