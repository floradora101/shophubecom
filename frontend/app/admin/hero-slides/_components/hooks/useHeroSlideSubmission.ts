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
import { useQueryClient } from "@tanstack/react-query";
import { heroSlidesApi } from "@/features/hero-slides/api";
import { heroSlideKeys } from "@/features/hero-slides/query-keys";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import type { HeroSlideFormValues } from "@/lib/hero-slides/admin/form";
import { fromFormValues } from "@/lib/hero-slides/admin/form";
import { resolveSlidePrimaryCtaHref } from "@/lib/utils/heroSlides.utils";

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
  const queryClient = useQueryClient();

  const onSubmit = useCallback(
    async (values: HeroSlideFormValues) => {
      let apiData: any = null;
      try {
        // Check for blob URLs - they can't be saved to the backend
        if (values.mediaImageUrl && values.mediaImageUrl.startsWith("blob:")) {
          toast.error("Please wait for the image to finish uploading before saving. Blob URLs cannot be saved.");
          return;
        }

        // Transform form values to HeroSlide format
        const heroSlide = fromFormValues(values, slide?.id);

        // Transform to API format
        apiData = transformToApiFormat(heroSlide);

        // Validate required fields before submission
        if (apiData.media.kind === "IMAGE" && !apiData.media.imageUrl) {
          toast.error("Please upload an image for this slide.");
          return;
        }
        if (apiData.media.kind === "PRODUCT" && !apiData.media.productSlug) {
          toast.error("Please select a product for this slide.");
          return;
        }
        if (apiData.media.kind === "VIDEO" && !apiData.media.videoUrl) {
          toast.error("Please provide a video URL for this slide.");
          return;
        }
        if (apiData.type === "OFFER") {
          if (!apiData.offerData?.offerLabel || !apiData.offerData.offerLabel.trim()) {
            toast.error("Please provide an offer label.");
            return;
          }
          if (!apiData.offerData?.offerEndsAt) {
            toast.error("Please provide an offer end date.");
            return;
          }
        }
        if (apiData.type === "EDITORS_PICK") {
          if (!apiData.editorsPickData?.productSlugs || apiData.editorsPickData.productSlugs.length === 0) {
            toast.error("Please provide at least one product slug for Editor's Pick slides.");
            return;
          }
        }
        if (apiData.type === "COMPARISON_BATTLE") {
          if (!apiData.comparisonBattleData?.leftProductSlug) {
            toast.error("Please provide a left product slug for Comparison Battle slides.");
            return;
          }
          if (!apiData.comparisonBattleData?.rightProductSlug) {
            toast.error("Please provide a right product slug for Comparison Battle slides.");
            return;
          }
          if (!apiData.comparisonBattleData?.comparisonPoints || apiData.comparisonBattleData.comparisonPoints.length === 0) {
            toast.error("Please provide at least one comparison point for Comparison Battle slides.");
            return;
          }
        }
        if (apiData.type === "PROMOTION") {
          if (!apiData.promotionId) {
            toast.error("Please select a promotion for this slide.");
            return;
          }
        }

        // Log for debugging (remove in production)
        console.log("Submitting hero slide:", {
          isUpdate: !!slide?.id,
          slideId: slide?.id,
          type: apiData.type,
          mediaKind: apiData.media?.kind,
          imageUrl: apiData.media?.imageUrl,
          data: JSON.stringify(apiData, null, 2),
        });

        if (slide?.id) {
          // Update existing slide
          const updated = await heroSlidesApi.updateHeroSlide(slide.id, apiData);
          console.log("Slide updated:", updated);
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: heroSlideKeys.all });
          queryClient.invalidateQueries({ queryKey: heroSlideKeys.active() });
          toast.success("Hero slide updated successfully!");
        } else {
          // Create new slide
          const created = await heroSlidesApi.createHeroSlide(apiData);
          console.log("Slide created:", created);
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: heroSlideKeys.all });
          queryClient.invalidateQueries({ queryKey: heroSlideKeys.active() });
          toast.success("Hero slide created successfully!");
        }

        onSuccess();
      } catch (error: any) {
        console.error("Failed to save hero slide:", error);
        if (error?.response) {
          console.error("Full error response:", JSON.stringify(error.response, null, 2));
          console.error("Error response data:", error.response.data);
          console.error("Error response status:", error.response.status);
        }
        if (apiData) {
          console.error("Request payload that failed:", JSON.stringify(apiData, null, 2));
        }

        // Extract validation errors from backend
        let errorMessage = "Failed to save hero slide. Please check the form for errors.";

        if (error?.response?.data) {
          const responseData = error.response.data;
          console.error("Parsed response data:", responseData);

          // Backend returns { success: false, message: string | string[], errors?: string[] }
          if (responseData.errors && Array.isArray(responseData.errors)) {
            errorMessage = responseData.errors.join(", ");
          } else if (Array.isArray(responseData.message)) {
            errorMessage = responseData.message.join(", ");
          } else if (responseData.message) {
            errorMessage = responseData.message;
          } else if (typeof responseData === 'object') {
            const errorDetails = Object.entries(responseData)
              .filter(([key]) => key !== 'success' && key !== 'statusCode' && key !== 'timestamp')
              .map(([key, value]) => {
                if (Array.isArray(value)) {
                  return `${key}: ${value.join(", ")}`;
                }
                return `${key}: ${value}`;
              })
              .join("; ");
            if (errorDetails) {
              errorMessage = errorDetails;
            }
          }
        } else if (error?.message) {
          errorMessage = error.message;
        }

        toast.error(errorMessage);
        throw error; // Re-throw to let form handle it
      }
    },
    [slide, onSuccess, queryClient]
  );

  return { onSubmit };
}

/**
 * Transform HeroSlide to API format (CreateHeroSlideDto)
 */
function transformToApiFormat(slide: HeroSlide): any {
  // Map frontend media kind (lowercase) to backend enum (uppercase)
  const mediaKindMap: Record<string, string> = {
    product: "PRODUCT",
    image: "IMAGE",
    video: "VIDEO",
    none: "NONE",
  };

  // Helper to convert empty strings to undefined
  const cleanValue = (value: string | undefined | null): string | undefined => {
    return value && value.trim() ? value.trim() : undefined;
  };

  // Helper to filter out blob URLs and empty strings (temporary local URLs that can't be saved)
  const cleanImageUrl = (url: string | undefined | null): string | undefined => {
    if (!url) return undefined;
    const trimmed = url.trim();
    // Filter out blob URLs and empty strings - they can't be sent to backend
    if (!trimmed || trimmed.startsWith("blob:")) {
      return undefined;
    }
    return trimmed;
  };

  // LANDSCAPE_IMAGE has a different structure - content and actionButton are nested
  if (slide.type === "LANDSCAPE_IMAGE") {
    const landscapeSlide = slide as any;
    const themeMap: Record<string, string> = {
      "glass-red": "GLASS_RED",
      "minimal-white": "MINIMAL_WHITE",
      "bold-dark": "BOLD_DARK",
      "centered-glass": "CENTERED_GLASS",
      "right-industrial": "RIGHT_INDUSTRIAL",
      "clean-modern": "CLEAN_MODERN",
    };

    // Extract from content object or use direct properties
    const content = landscapeSlide.content || {};
    const actionButton = landscapeSlide.actionButton || landscapeSlide.ctaPrimary || {};

    return {
      type: slide.type,
      priority: slide.priority,
      isActive: slide.isActive,
      startsAt: cleanValue(slide.startsAt),
      endsAt: cleanValue(slide.endsAt),
      // Base fields - extract from content for LANDSCAPE_IMAGE
      headline: content.headline || landscapeSlide.headline || "",
      description: content.description || landscapeSlide.description || "",
      highlight: cleanValue(content.highlight || landscapeSlide.highlight),
      badgeText: cleanValue(content.badge || landscapeSlide.badgeText),
      ctaPrimary: {
        label: actionButton.label || "",
        href: actionButton.href?.trim() || "/products",
      },
      media: {
        kind: "IMAGE", // LANDSCAPE_IMAGE always uses image
        imageUrl: cleanImageUrl(slide.media.imageUrl), // Required for IMAGE kind
        alt: cleanValue(slide.media.alt),
        position: slide.media.position,
      },
      landscapeImageData: {
        theme: themeMap[landscapeSlide.theme] || landscapeSlide.theme?.toUpperCase().replace(/-/g, "_") || "GLASS_RED",
        content: {
          badge: content.badge || "",
          headline: content.headline || landscapeSlide.headline || "",
          highlight: content.highlight || "",
          description: content.description || landscapeSlide.description || "",
        },
        actionButton: {
          label: actionButton.label || "",
          href: actionButton.href?.trim() || "/products",
        },
      },
    };
  }

  // For all other types, use standard structure
  const baseData: any = {
    type: slide.type,
    priority: slide.priority,
    isActive: slide.isActive,
    startsAt: cleanValue(slide.startsAt),
    endsAt: cleanValue(slide.endsAt),
    badgeText: cleanValue(slide.badgeText),
    headline: slide.headline.trim(),
    highlight: cleanValue(slide.highlight),
    description: slide.description.trim(),
    ctaPrimary: {
      label: slide.ctaPrimary.label.trim(),
      href: resolveSlidePrimaryCtaHref(slide),
    },
    media: {
      kind: mediaKindMap[slide.media.kind] || slide.media.kind.toUpperCase(),
      // Only include productSlug if kind is PRODUCT and it exists
      ...(slide.media.kind === "product" && cleanValue(slide.media.productSlug) && { productSlug: cleanValue(slide.media.productSlug) }),
      // Only include imageUrl if kind is IMAGE and it exists (required for IMAGE kind)
      ...(slide.media.kind === "image" && cleanImageUrl(slide.media.imageUrl) && { imageUrl: cleanImageUrl(slide.media.imageUrl) }),
      // Only include videoUrl if kind is VIDEO and it exists
      ...(slide.media.kind === "video" && cleanValue(slide.media.videoUrl) && { videoUrl: cleanValue(slide.media.videoUrl) }),
      ...("alt" in slide.media && cleanValue(slide.media.alt) && { alt: cleanValue(slide.media.alt) }),
      ...("position" in slide.media && slide.media.position && { position: slide.media.position }),
      ...("aspect" in slide.media && slide.media.aspect && { aspect: slide.media.aspect }),
    },
  };

  // Add type-specific data
  switch (slide.type) {
    case "PRODUCT_SPOTLIGHT":
      baseData.productSpotlightData = {
        features: (slide as any).features || [],
      };
      break;

    case "OFFER":
      // Convert offerEndsAt to ISO 8601 format
      // The form sends datetime-local format (YYYY-MM-DDTHH:mm) which needs to be converted to ISO 8601
      let offerEndsAtValue: string = "";
      const offerEndsAt = (slide as any).offerEndsAt;
      if (offerEndsAt && offerEndsAt.trim()) {
        try {
          // datetime-local format: "2024-12-31T23:59" -> convert to ISO 8601
          // If it's already ISO format, use it directly
          if (offerEndsAt.includes("T") && offerEndsAt.includes("Z")) {
            // Already ISO format
            offerEndsAtValue = offerEndsAt;
          } else if (offerEndsAt.includes("T")) {
            // datetime-local format, convert to ISO
            const date = new Date(offerEndsAt);
            if (!isNaN(date.getTime())) {
              offerEndsAtValue = date.toISOString();
            } else {
              // If parsing fails, try adding timezone
              offerEndsAtValue = new Date(offerEndsAt + ":00").toISOString();
            }
          } else {
            // Just a date, add time
            const date = new Date(offerEndsAt + "T23:59:59");
            if (!isNaN(date.getTime())) {
              offerEndsAtValue = date.toISOString();
            }
          }
        } catch (e) {
          console.warn("Invalid offerEndsAt date:", offerEndsAt, e);
          // Default to 30 days from now if invalid
          const defaultDate = new Date();
          defaultDate.setDate(defaultDate.getDate() + 30);
          offerEndsAtValue = defaultDate.toISOString();
        }
      } else {
        // Default to 30 days from now if not provided
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 30);
        offerEndsAtValue = defaultDate.toISOString();
      }

      baseData.offerData = {
        offerLabel: (slide as any).offerLabel || "",
        offerEndsAt: offerEndsAtValue,
        promoCode: cleanValue((slide as any).promoCode),
      };
      break;

    case "TESTIMONIAL":
      baseData.testimonialData = {
        quote: (slide as any).quote || "",
        authorName: (slide as any).authorName || "",
        rating: (slide as any).rating || 5,
        stats: (slide as any).stats || [],
      };
      break;

    case "CATEGORY_SPOTLIGHT":
      baseData.categorySpotlightData = {
        categorySlug: (slide as any).categorySlug || "",
        categoryBullets: (slide as any).categoryBullets || [],
      };
      break;

    case "EDITORS_PICK":
      const productSlugs = (slide as any).productSlugs || [];
      // Ensure productSlugs is an array and filter out empty strings
      const validProductSlugs = Array.isArray(productSlugs)
        ? productSlugs.filter((slug: string) => slug && slug.trim())
        : [];

      if (validProductSlugs.length === 0) {
        throw new Error("At least one product slug is required for Editor's Pick slides.");
      }

      baseData.editorsPickData = {
        productSlugs: validProductSlugs,
        editorNote: cleanValue((slide as any).editorNote),
      };
      break;

    case "COMPARISON_BATTLE":
      const leftProductSlug = cleanValue((slide as any).leftProductSlug);
      const rightProductSlug = cleanValue((slide as any).rightProductSlug);
      const comparisonPoints = (slide as any).comparisonPoints || [];

      if (!leftProductSlug) {
        throw new Error("Left product slug is required for Comparison Battle slides.");
      }
      if (!rightProductSlug) {
        throw new Error("Right product slug is required for Comparison Battle slides.");
      }

      // Ensure comparisonPoints is an array of valid objects
      let validComparisonPoints: any[] = [];
      if (Array.isArray(comparisonPoints)) {
        validComparisonPoints = comparisonPoints.filter((point: any) =>
          point &&
          typeof point === 'object' &&
          point.label &&
          point.label.trim() &&
          point.leftValue &&
          point.leftValue.trim() &&
          point.rightValue &&
          point.rightValue.trim()
        );
      }

      if (validComparisonPoints.length === 0) {
        throw new Error(
          "At least one valid comparison point is required for Comparison Battle slides. " +
          "Format: label|leftValue|rightValue (e.g., 'Price|$99|$149, Battery|24h|18h')"
        );
      }

      baseData.comparisonBattleData = {
        leftProductSlug,
        rightProductSlug,
        comparisonPoints: validComparisonPoints,
      };
      break;

    case "PROMOTION":
      baseData.promotionId = (slide as any).promotionId;
      baseData.promotionData = {
        promotionId: (slide as any).promotionId,
        customColors: (slide as any).customColors,
      };
      break;
  }

  return baseData;
}
