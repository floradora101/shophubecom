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

import { useMemo } from "react";
import { useForm } from "react-hook-form";
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
  const initialValues = useMemo(() => {
    if (slide) {
      return toFormValues(slide);
    }
    return getDefaultHeroSlideFormValues();
  }, [slide]);

  const form = useForm<HeroSlideFormValues>({
    // resolver: zodResolver(HeroSlideFormSchema), // Temporarily disabled for build
    defaultValues: initialValues,
  });

  const formValues = form.watch();

  return {
    form,
    formValues,
  };
}
