import {
  apiGet,
  apiGetWithParams,
  apiPost,
  apiPut,
  apiDelete,
} from "@/lib/api/request";
import type { HeroSlide } from "@/lib/types/heroSlides.types";

export interface HeroSlideFilters {
  search?: string;
  type?: HeroSlide["type"];
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "priority" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface HeroSlidesResponse {
  data: HeroSlide[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Helper to clean empty strings to undefined
function cleanString(value: string | null | undefined): string | undefined {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }
  return value.trim();
}

// Transform backend response to frontend HeroSlide type
function transformBackendSlide(backendSlide: any): HeroSlide {
  // Clean media object - convert empty strings to undefined
  const media = backendSlide.media || { kind: "none" as const };

  // Convert backend MediaKind enum (uppercase) to frontend format (lowercase)
  const kindMap: Record<string, string> = {
    "IMAGE": "image",
    "PRODUCT": "product",
    "VIDEO": "video",
    "NONE": "none",
  };
  const frontendKind = kindMap[media.kind] || media.kind?.toLowerCase() || "none";

  const cleanedMedia = {
    ...media,
    kind: frontendKind as "image" | "product" | "video" | "none",
    imageUrl: cleanString(media.imageUrl),
    videoUrl: cleanString(media.videoUrl),
    productSlug: cleanString(media.productSlug),
    alt: cleanString(media.alt),
  };

  // Backend returns ctaPrimary and media as objects already
  const baseSlide = {
    id: backendSlide.id,
    type: backendSlide.type,
    priority: backendSlide.priority,
    isActive: backendSlide.isActive,
    startsAt: backendSlide.startsAt ? new Date(backendSlide.startsAt).toISOString() : undefined,
    endsAt: backendSlide.endsAt ? new Date(backendSlide.endsAt).toISOString() : undefined,
    badgeText: cleanString(backendSlide.badgeText),
    headline: backendSlide.headline || "",
    highlight: cleanString(backendSlide.highlight),
    description: backendSlide.description || "",
    ctaPrimary: backendSlide.ctaPrimary || {
      label: "",
      href: "",
    },
    media: cleanedMedia,
  };

  // Add type-specific fields from typeSpecificData
  const typeData = backendSlide.typeSpecificData || {};

  switch (backendSlide.type) {
    case "PRODUCT_SPOTLIGHT":
      return {
        ...baseSlide,
        type: "PRODUCT_SPOTLIGHT",
        features: typeData.features,
      } as HeroSlide;

    case "OFFER":
      return {
        ...baseSlide,
        type: "OFFER",
        offerLabel: typeData.offerLabel,
        offerEndsAt: typeData.offerEndsAt,
        promoCode: typeData.promoCode,
      } as HeroSlide;

    case "TESTIMONIAL":
      return {
        ...baseSlide,
        type: "TESTIMONIAL",
        quote: typeData.quote,
        authorName: typeData.authorName,
        rating: typeData.rating,
        stats: typeData.stats,
      } as HeroSlide;

    case "LANDSCAPE_IMAGE":
      // Backend stores landscapeImageData directly in typeSpecificData
      const landscapeData = typeData.landscapeImageData || typeData;

      // Debug logging (remove in production)
      if (process.env.NODE_ENV === "development") {
        console.log("[HeroSlides API] LANDSCAPE_IMAGE data:", {
          typeData,
          landscapeData,
          theme: landscapeData?.theme,
        });
      }

      // Convert backend theme enum (GLASS_RED) to frontend format (glass-red)
      const themeMap: Record<string, string> = {
        "GLASS_RED": "glass-red",
        "MINIMAL_WHITE": "minimal-white",
        "BOLD_DARK": "bold-dark",
        "CENTERED_GLASS": "centered-glass",
        "RIGHT_INDUSTRIAL": "right-industrial",
        "CLEAN_MODERN": "clean-modern",
      };

      const backendTheme = landscapeData?.theme || "";
      const frontendTheme = themeMap[backendTheme] || (backendTheme ? backendTheme.toLowerCase().replace(/_/g, "-") : "glass-red");

      const transformedSlide = {
        ...baseSlide,
        type: "LANDSCAPE_IMAGE",
        theme: frontendTheme as any,
        content: landscapeData?.content || {
          badge: baseSlide.badgeText || "",
          headline: baseSlide.headline || "",
          highlight: baseSlide.highlight || "",
          description: baseSlide.description || "",
        },
        actionButton: landscapeData?.actionButton || baseSlide.ctaPrimary,
        media: cleanedMedia, // Use cleaned media
      } as HeroSlide;

      // Debug logging (remove in production)
      if (process.env.NODE_ENV === "development") {
        const landscapeSlide = transformedSlide as { theme?: string; content?: unknown; actionButton?: unknown };
        console.log("[HeroSlides API] Transformed LANDSCAPE_IMAGE slide:", {
          theme: landscapeSlide.theme,
          hasContent: !!landscapeSlide.content,
          hasActionButton: !!landscapeSlide.actionButton,
        });
      }

      return transformedSlide;

    case "CATEGORY_SPOTLIGHT":
      return {
        ...baseSlide,
        type: "CATEGORY_SPOTLIGHT",
        categorySlug: typeData.categorySlug,
        categoryBullets: typeData.categoryBullets,
        media: { kind: "none" },
      } as HeroSlide;

    case "EDITORS_PICK":
      return {
        ...baseSlide,
        type: "EDITORS_PICK",
        productSlugs: typeData.productSlugs,
        editorNote: typeData.editorNote,
        media: { kind: "none" },
      } as HeroSlide;

    case "COMPARISON_BATTLE":
      return {
        ...baseSlide,
        type: "COMPARISON_BATTLE",
        leftProductSlug: typeData.leftProductSlug,
        rightProductSlug: typeData.rightProductSlug,
        comparisonPoints: typeData.comparisonPoints,
        media: { kind: "none" },
      } as HeroSlide;

    case "PROMOTION":
      return {
        ...baseSlide,
        type: "PROMOTION",
        promotionId: backendSlide.promotionId ?? typeData.promotionId ?? typeData.promotionData?.promotionId,
      } as HeroSlide;

    default:
      return baseSlide as HeroSlide;
  }
}

export const heroSlidesApi = {
  /**
   * Get active hero slides (public endpoint)
   * Returns only active slides within their date range
   */
  async getActiveSlides(): Promise<HeroSlide[]> {
    const slides = await apiGet<any[]>("/hero-slides/active");
    return slides.map(transformBackendSlide);
  },

  /**
   * Get all hero slides with filtering and pagination (admin)
   */
  async getHeroSlides(
    filters?: HeroSlideFilters
  ): Promise<HeroSlidesResponse> {
    const result = await apiGetWithParams<{
      data: any[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>("/hero-slides", filters);
    return {
      ...result,
      data: result.data.map(transformBackendSlide),
    };
  },

  /**
   * Get a single hero slide by ID (admin)
   */
  async getHeroSlideById(id: string): Promise<HeroSlide> {
    const slide = await apiGet<any>(`/hero-slides/${id}`);
    return transformBackendSlide(slide);
  },

  /**
   * Create a new hero slide (admin)
   */
  async createHeroSlide(data: any): Promise<HeroSlide> {
    const slide = await apiPost<any>("/hero-slides", data);
    return transformBackendSlide(slide);
  },

  /**
   * Update a hero slide (admin)
   */
  async updateHeroSlide(id: string, data: any): Promise<HeroSlide> {
    const slide = await apiPut<any>(`/hero-slides/${id}`, data);
    return transformBackendSlide(slide);
  },

  /**
   * Delete a hero slide (admin)
   */
  async deleteHeroSlide(id: string): Promise<void> {
    await apiDelete<void>(`/hero-slides/${id}`);
  },
};
