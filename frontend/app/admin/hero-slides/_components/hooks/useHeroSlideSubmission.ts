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
      let apiData: Record<string, unknown> | null = null;
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
        const media = apiData.media as { kind?: string; imageUrl?: string; productSlug?: string; videoUrl?: string };
        if (media.kind === "IMAGE" && !media.imageUrl) {
          toast.error("Please upload an image for this slide.");
          return;
        }
        if (media.kind === "PRODUCT" && !media.productSlug) {
          toast.error("Please select a product for this slide.");
          return;
        }
        if (media.kind === "VIDEO" && !media.videoUrl) {
          toast.error("Please provide a video URL for this slide.");
          return;
        }
        const offerData = apiData.offerData as { offerLabel?: string; offerEndsAt?: string } | undefined;
        if (apiData.type === "OFFER") {
          if (!offerData?.offerLabel || !offerData.offerLabel.trim()) {
            toast.error("Please provide an offer label.");
            return;
          }
          if (!offerData?.offerEndsAt) {
            toast.error("Please provide an offer end date.");
            return;
          }
        }
        const editorsPickData = apiData.editorsPickData as { productSlugs?: string[] } | undefined;
        if (apiData.type === "EDITORS_PICK") {
          if (!editorsPickData?.productSlugs || editorsPickData.productSlugs.length === 0) {
            toast.error("Please provide at least one product slug for Editor's Pick slides.");
            return;
          }
        }
        const comparisonData = apiData.comparisonBattleData as { leftProductSlug?: string; rightProductSlug?: string; comparisonPoints?: unknown[] } | undefined;
        if (apiData.type === "COMPARISON_BATTLE") {
          if (!comparisonData?.leftProductSlug) {
            toast.error("Please provide a left product slug for Comparison Battle slides.");
            return;
          }
          if (!comparisonData?.rightProductSlug) {
            toast.error("Please provide a right product slug for Comparison Battle slides.");
            return;
          }
          if (!comparisonData?.comparisonPoints || comparisonData.comparisonPoints.length === 0) {
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
        const logMedia = apiData.media as { kind?: string; imageUrl?: string } | undefined;
        console.log("Submitting hero slide:", {
          isUpdate: !!slide?.id,
          slideId: slide?.id,
          type: apiData.type,
          mediaKind: logMedia?.kind,
          imageUrl: logMedia?.imageUrl,
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
      } catch (error: unknown) {
        console.error("Failed to save hero slide:", error);
        const err = error as { response?: { data?: unknown; status?: number }; message?: string };
        if (err?.response) {
          console.error("Full error response:", JSON.stringify(err.response, null, 2));
          console.error("Error response data:", err.response.data);
          console.error("Error response status:", err.response.status);
        }
        if (apiData) {
          console.error("Request payload that failed:", JSON.stringify(apiData, null, 2));
        }

        // Extract validation errors from backend
        let errorMessage = "Failed to save hero slide. Please check the form for errors.";

        if (err?.response?.data) {
          const responseData = err.response.data as {
            errors?: string[];
            message?: string | string[];
          };
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
        } else if (err?.message) {
          errorMessage = err.message;
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
function transformToApiFormat(slide: HeroSlide): Record<string, unknown> {
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
    const themeMap: Record<string, string> = {
      "glass-red": "GLASS_RED",
      "minimal-white": "MINIMAL_WHITE",
      "bold-dark": "BOLD_DARK",
      "centered-glass": "CENTERED_GLASS",
      "right-industrial": "RIGHT_INDUSTRIAL",
      "clean-modern": "CLEAN_MODERN",
    };

    // Extract from content object or use direct properties
    const content = slide.content || {};
    const actionButton = slide.actionButton || {};

    return {
      type: slide.type,
      priority: slide.priority,
      isActive: slide.isActive,
      startsAt: cleanValue(slide.startsAt),
      endsAt: cleanValue(slide.endsAt),
      // Base fields - extract from content for LANDSCAPE_IMAGE
      headline: content.headline || "",
      description: content.description || "",
      highlight: cleanValue(content.highlight),
      badgeText: cleanValue(content.badge),
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
        theme: themeMap[slide.theme] || slide.theme?.toUpperCase().replace(/-/g, "_") || "GLASS_RED",
        content: {
          badge: content.badge || "",
          headline: content.headline || "",
          highlight: content.highlight || "",
          description: content.description || "",
        },
        actionButton: {
          label: actionButton.label || "",
          href: actionButton.href?.trim() || "/products",
        },
      },
    };
  }

  // For all other types, use standard structure
  const baseData: Record<string, unknown> = {
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

  // Add type-specific data (slide is narrowed by switch)
  switch (slide.type) {
    case "PRODUCT_SPOTLIGHT":
      baseData.productSpotlightData = {
        features: slide.features || [],
      };
      break;

    case "OFFER":
      // Convert offerEndsAt to ISO 8601 format
      // The form sends datetime-local format (YYYY-MM-DDTHH:mm) which needs to be converted to ISO 8601
      let offerEndsAtValue: string = "";
      const offerEndsAt = slide.offerEndsAt;
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
        offerLabel: slide.offerLabel || "",
        offerEndsAt: offerEndsAtValue,
        promoCode: cleanValue(slide.promoCode),
      };
      break;

    case "TESTIMONIAL":
      baseData.testimonialData = {
        quote: slide.quote || "",
        authorName: slide.authorName || "",
        rating: slide.rating || 5,
        stats: slide.stats || [],
      };
      break;

    case "CATEGORY_SPOTLIGHT":
      baseData.categorySpotlightData = {
        categorySlug: slide.categorySlug || "",
        categoryBullets: slide.categoryBullets || [],
      };
      break;

    case "EDITORS_PICK":
      const productSlugs = slide.productSlugs || [];
      // Ensure productSlugs is an array and filter out empty strings
      const validProductSlugs = Array.isArray(productSlugs)
        ? productSlugs.filter((slug: string) => slug && slug.trim())
        : [];

      if (validProductSlugs.length === 0) {
        throw new Error("At least one product slug is required for Editor's Pick slides.");
      }

      baseData.editorsPickData = {
        productSlugs: validProductSlugs,
        editorNote: cleanValue(slide.editorNote),
      };
      break;

    case "COMPARISON_BATTLE":
      const leftProductSlug = cleanValue(slide.leftProductSlug);
      const rightProductSlug = cleanValue(slide.rightProductSlug);
      const comparisonPoints = slide.comparisonPoints || [];

      if (!leftProductSlug) {
        throw new Error("Left product slug is required for Comparison Battle slides.");
      }
      if (!rightProductSlug) {
        throw new Error("Right product slug is required for Comparison Battle slides.");
      }

      // Ensure comparisonPoints is an array of valid objects
      type ComparisonPoint = { label: string; leftValue: string; rightValue: string };
      const isComparisonPoint = (p: unknown): p is ComparisonPoint =>
        p != null &&
        typeof p === "object" &&
        "label" in p &&
        "leftValue" in p &&
        "rightValue" in p &&
        typeof (p as ComparisonPoint).label === "string" &&
        (p as ComparisonPoint).label.trim().length > 0 &&
        typeof (p as ComparisonPoint).leftValue === "string" &&
        (p as ComparisonPoint).leftValue.trim().length > 0 &&
        typeof (p as ComparisonPoint).rightValue === "string" &&
        (p as ComparisonPoint).rightValue.trim().length > 0;
      let validComparisonPoints: ComparisonPoint[] = [];
      if (Array.isArray(comparisonPoints)) {
        validComparisonPoints = comparisonPoints.filter(isComparisonPoint);
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
      baseData.promotionId = slide.promotionId;
      baseData.promotionData = {
        promotionId: slide.promotionId,
        customColors: slide.customColors,
      };
      break;
  }

  return baseData;
}
