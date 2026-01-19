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
  }, [formValues, slide]);

  return previewSlide;
}
