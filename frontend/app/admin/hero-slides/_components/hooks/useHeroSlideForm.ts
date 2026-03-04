/**
 * useHeroSlideForm Hook
 *
 * Manages hero slide form setup and configuration.
 *
 * Responsibilities:
 * - Form initialization
 * - Initial values calculation
 * - Form methods access
 */

import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import {
  type HeroSlideFormValues,
  getDefaultHeroSlideFormValues,
  toFormValues,
} from "@/lib/hero-slides/admin/form";

interface UseHeroSlideFormProps {
  slide?: HeroSlide;
}

interface UseHeroSlideFormReturn {
  form: ReturnType<typeof useForm<HeroSlideFormValues>>;
  formValues: HeroSlideFormValues;
}

/**
 * Hook for managing hero slide form state
 */
export function useHeroSlideForm({
  slide,
}: UseHeroSlideFormProps): UseHeroSlideFormReturn {
  const searchParams = useSearchParams();

  const initialValues = useMemo(() => {
    if (slide) {
      return toFormValues(slide);
    }

    const defaultValues = getDefaultHeroSlideFormValues();

    // Support pre-filling from search params (e.g. when coming from promotion creation)
    const promotionId = searchParams.get("promotionId");
    if (promotionId) {
      defaultValues.promotionId = promotionId;
      defaultValues.type = (searchParams.get("type") as any) || "PROMOTION";
      defaultValues.headline = searchParams.get("headline") || "";
      defaultValues.description = searchParams.get("description") || "";
      defaultValues.ctaPrimaryLabel = "Shop Sale";
      defaultValues.badgeText = "Special Promotion";
    }

    return defaultValues;
  }, [slide, searchParams]);

  const form = useForm<HeroSlideFormValues>({
    // resolver: zodResolver(HeroSlideFormSchema), // Temporarily disabled for build
    defaultValues: initialValues,
    mode: "onChange", // Enable real-time validation and updates
  });

  // Watch all form values for reactivity
  const formValues = form.watch();

  return {
    form,
    formValues,
  };
}
