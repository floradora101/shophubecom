/**
 * useHeroSlidePreview Hook
 *
 * Generates preview slide object from form values.
 *
 * Responsibilities:
 * - Real-time preview generation
 * - Fallback handling for validation errors
 */

import { useMemo } from "react";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import {
  type HeroSlideFormValues,
  getDefaultHeroSlideFormValues,
  fromFormValues,
} from "@/lib/hero-slides/admin/form";

interface UseHeroSlidePreviewProps {
  formValues: HeroSlideFormValues;
  slide?: HeroSlide;
}

/**
 * Hook for generating preview slide from form values
 */
export function useHeroSlidePreview({
  formValues,
  slide,
}: UseHeroSlidePreviewProps): HeroSlide {
  const previewSlide = useMemo(() => {
    try {
      return fromFormValues(formValues, slide?.id);
    } catch (e) {
      // If validation fails during real-time mapping, return current or default
      return slide || fromFormValues(getDefaultHeroSlideFormValues());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Use JSON.stringify for complex objects to prevent unnecessary re-renders
    // Only re-compute when actual values change, not on every render
    JSON.stringify({
      type: formValues.type,
      mediaKind: formValues.mediaKind,
      mediaImageUrl: formValues.mediaImageUrl,
      mediaProductSlug: formValues.mediaProductSlug,
      mediaAlt: formValues.mediaAlt,
      mediaPosition: formValues.mediaPosition,
      mediaAspect: formValues.mediaAspect,
      headline: formValues.headline,
      description: formValues.description,
      badgeText: formValues.badgeText,
      highlight: formValues.highlight,
      landscapeTheme: formValues.landscapeTheme,
      categorySlug: formValues.categorySlug,
      categoryBullets: formValues.categoryBullets,
      productSlugs: formValues.productSlugs,
      editorNote: formValues.editorNote,
      leftProductSlug: formValues.leftProductSlug,
      rightProductSlug: formValues.rightProductSlug,
      comparisonPoints: formValues.comparisonPoints,
      priority: formValues.priority,
      isActive: formValues.isActive,
      startsAt: formValues.startsAt,
      endsAt: formValues.endsAt,
      ctaPrimaryLabel: formValues.ctaPrimaryLabel,
      ctaPrimaryHref: formValues.ctaPrimaryHref,
      offerLabel: formValues.offerLabel,
      offerEndsAt: formValues.offerEndsAt,
      promoCode: formValues.promoCode,
      quote: formValues.quote,
      authorName: formValues.authorName,
      rating: formValues.rating,
      testimonialStats: formValues.testimonialStats,
      promotionId: formValues.promotionId,
      promotionBgColor: formValues.promotionBgColor,
      promotionTextColor: formValues.promotionTextColor,
    }),
    slide?.id, // Only watch slide ID, not entire slide object
  ]);

  return previewSlide;
}
