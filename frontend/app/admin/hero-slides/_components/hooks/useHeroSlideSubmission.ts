/**
 * useHeroSlideSubmission Hook
 *
 * Handles hero slide form submission.
 *
 * Responsibilities:
 * - Form submission logic
 * - Error handling
 * - Success callbacks
 */

import { useCallback } from "react";
import { toast } from "sonner";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import type { HeroSlideFormValues } from "@/lib/hero-slides/admin/form";
import { fromFormValues } from "@/lib/hero-slides/admin/form";

interface UseHeroSlideSubmissionProps {
  slide?: HeroSlide;
  onSuccess: () => void;
}

interface UseHeroSlideSubmissionReturn {
  onSubmit: (values: HeroSlideFormValues) => Promise<void>;
}

/**
 * Hook for handling hero slide form submission
 */
export function useHeroSlideSubmission({
  slide,
  onSuccess,
}: UseHeroSlideSubmissionProps): UseHeroSlideSubmissionReturn {
  const onSubmit = useCallback(
    async (values: HeroSlideFormValues) => {
      try {
        const data = fromFormValues(values, slide?.id);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        toast.success(
          slide
            ? "Hero slide updated successfully!"
            : "Hero slide created successfully!"
        );
        onSuccess();
      } catch (error) {
        toast.error(
          "Failed to save hero slide. Please check the form for errors."
        );
      }
    },
    [slide, onSuccess]
  );

  return { onSubmit };
}
