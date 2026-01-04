import { z } from "zod";
import type {
  HeroSlide,
  HeroSlideType,
  BaseHeroSlide,
  LandscapeImageSlide,
} from "@/lib/types/heroSlides.types";

// Base schema for common fields
const baseHeroSlideSchema = z.object({
  // Basic fields
  type: z.enum([
    "PRODUCT_SPOTLIGHT",
    "CATEGORY_SPOTLIGHT",
    "OFFER",
    "TESTIMONIAL",
    "LANDSCAPE_IMAGE",
  ] as const),

  priority: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),

  // Scheduling
  startsAt: z.string().datetime().optional().or(z.literal("")),
  endsAt: z.string().datetime().optional().or(z.literal("")),

  // Content - Fixed-height safe constraints
  badgeText: z.string().max(30).optional().or(z.literal("")), // Prevent badge overflow
  headline: z.string().min(1, "Headline is required").max(80), // line-clamp-2/3 safe
  highlight: z.string().max(60).optional().or(z.literal("")), // Secondary headline limit
  description: z.string().min(1, "Description is required").max(200), // line-clamp-2 safe

  // CTA - No wrap constraints
  ctaPrimaryLabel: z.string().min(1, "Primary CTA label is required").max(20), // No wrap safe
  ctaPrimaryHref: z
    .string()
    .min(1, "Primary CTA link is required")
    .url("Must be a valid URL"),
  ctaSecondaryLabel: z.string().max(20).optional().or(z.literal("")), // No wrap safe
  ctaSecondaryHref: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),

  // Media
  mediaKind: z.enum(["product", "image", "none"]),
  mediaProductSlug: z.string().optional().or(z.literal("")),
  mediaImageUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  mediaAlt: z.string().max(200).optional().or(z.literal("")),
  mediaPosition: z
    .enum(["center", "top", "bottom", "left", "right"])
    .optional(),
  mediaAspect: z.enum(["landscape", "default"]).optional(),

  // Theme - Required for proper theming
  themeAccentToken: z
    .enum([
      "red-black",
      "red-blue",
      "red-pink",
      "red-gray",
      "red-burgundy",
      "blue-green",
      "red-orange",
    ])
    .default("red-black"),

  // Type-specific fields
  // CATEGORY_SPOTLIGHT
  categoryBullets: z
    .array(z.string().min(1).max(80)) // line-clamp-1 safe, max 3 enforced
    .max(3, "Maximum 3 bullet points allowed")
    .optional(),

  // OFFER
  offerLabel: z
    .string()
    .min(1, "Offer label is required")
    .max(30) // Prominent display safe
    .optional()
    .or(z.literal("")),
  offerEndsAt: z
    .string()
    .datetime("Must be a valid date")
    .optional()
    .or(z.literal("")),
  promoCode: z.string().max(15).optional().or(z.literal("")), // Copy button safe
  urgencyLevel: z.enum(["low", "medium", "high"]).optional().default("medium"),
  dealPills: z
    .array(z.string().min(1).max(20)) // Short pill labels
    .max(3, "Maximum 3 deal pills allowed")
    .optional(),

  // TESTIMONIAL
  quote: z
    .string()
    .min(1, "Quote is required")
    .max(200) // line-clamp-2 safe in quote card
    .optional()
    .or(z.literal("")),
  authorName: z
    .string()
    .min(1, "Author name is required")
    .max(30) // Author name display safe
    .optional()
    .or(z.literal("")),
  rating: z.number().int().min(1).max(5).default(5),
  testimonialStats: z
    .array(
      z.object({
        label: z.string().min(1).max(25), // Short stat labels
        value: z.string().min(1).max(15), // Short stat values
      })
    )
    .max(3, "Maximum 3 stats allowed")
    .optional(),

  // LANDSCAPE_IMAGE
  subtitle: z.string().max(80).optional().or(z.literal("")), // Subtitle overlay safe
  textPosition: z.enum(["left", "center", "right"]).default("center"),
  overlayOpacity: z.number().min(0).max(1).default(0.3),
});

// Main schema with conditional validation
export const HeroSlideFormSchema = baseHeroSlideSchema
  .refine(
    (data) => {
      // Media validation
      if (data.mediaKind === "image" && !data.mediaImageUrl?.trim()) {
        return false;
      }
      if (data.mediaKind === "product" && !data.mediaProductSlug?.trim()) {
        return false;
      }
      return true;
    },
    {
      message:
        "Image URL is required when media kind is 'image', product slug is required when media kind is 'product'",
      path: ["mediaImageUrl"], // Will show on the appropriate field
    }
  )
  .refine(
    (data) => {
      // Type-specific validation
      switch (data.type) {
        case "CATEGORY_SPOTLIGHT":
          return (
            data.categoryBullets &&
            data.categoryBullets.length >= 1 &&
            data.categoryBullets.length <= 3
          );
        case "OFFER":
          return data.offerLabel?.trim() && data.offerEndsAt?.trim();
        case "TESTIMONIAL":
          return (
            data.quote?.trim() &&
            data.authorName?.trim() &&
            data.rating !== undefined &&
            (!data.testimonialStats || data.testimonialStats.length <= 3)
          );
        default:
          return true;
      }
    },
    {
      message: "Required fields are missing for this slide type",
      path: ["type"],
    }
  )
  .refine(
    (data) => {
      // Scheduling validation
      if (data.startsAt && data.endsAt) {
        const startDate = new Date(data.startsAt);
        const endDate = new Date(data.endsAt);
        return endDate > startDate;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endsAt"],
    }
  )
  .refine(
    (data) => {
      // Secondary CTA validation - both label and href must be provided together
      const hasSecondaryLabel = data.ctaSecondaryLabel?.trim();
      const hasSecondaryHref = data.ctaSecondaryHref?.trim();
      return (
        (hasSecondaryLabel && hasSecondaryHref) ||
        (!hasSecondaryLabel && !hasSecondaryHref)
      );
    },
    {
      message: "Both secondary CTA label and link are required together",
      path: ["ctaSecondaryLabel"],
    }
  );

export type HeroSlideFormValues = z.infer<typeof HeroSlideFormSchema>;

// Helper to get default values for a specific type
export function getDefaultHeroSlideFormValues(
  type?: HeroSlideType
): HeroSlideFormValues {
  const defaults: HeroSlideFormValues = {
    type: type || "PRODUCT_SPOTLIGHT",
    priority: 0,
    isActive: true,
    startsAt: "",
    endsAt: "",
    badgeText: "",
    headline: "",
    highlight: "",
    description: "",
    ctaPrimaryLabel: "",
    ctaPrimaryHref: "",
    ctaSecondaryLabel: "",
    ctaSecondaryHref: "",
    mediaKind: "none",
    mediaProductSlug: "",
    mediaImageUrl: "",
    mediaAlt: "",
    mediaPosition: "center",
    mediaAspect: "default",
    themeAccentToken: "red-black",
    categoryBullets: type === "CATEGORY_SPOTLIGHT" ? [""] : undefined,
    offerLabel: "",
    offerEndsAt: "",
    promoCode: "",
    urgencyLevel: "medium",
    dealPills: [],
    quote: "",
    authorName: "",
    rating: 5,
    testimonialStats: [],
    subtitle: "",
    textPosition: "center",
    overlayOpacity: 0.3,
  };

  return defaults;
}

// Convert HeroSlide to form values
export function toFormValues(slide: HeroSlide): HeroSlideFormValues {
  const baseValues = {
    type: slide.type,
    priority: slide.priority,
    isActive: slide.isActive,
    startsAt: slide.startsAt || "",
    endsAt: slide.endsAt || "",
    badgeText: slide.badgeText || "",
    headline: slide.headline,
    highlight: slide.highlight || "",
    description: slide.description,
    ctaPrimaryLabel: slide.ctaPrimary.label,
    ctaPrimaryHref: slide.ctaPrimary.href,
    ctaSecondaryLabel: slide.ctaSecondary?.label || "",
    ctaSecondaryHref: slide.ctaSecondary?.href || "",
    mediaKind: slide.media.kind,
    mediaProductSlug:
      "productSlug" in slide.media ? slide.media.productSlug || "" : "",
    mediaImageUrl: slide.media.imageUrl || "",
    mediaAlt: slide.media.alt || "",
    mediaPosition: slide.media.position || "center",
    mediaAspect:
      "aspect" in slide.media ? slide.media.aspect || "default" : "default",
    themeAccentToken: slide.theme?.accentToken || "red-black",
  };

  // Add type-specific fields
  switch (slide.type) {
    case "CATEGORY_SPOTLIGHT":
      return {
        ...baseValues,
        categoryBullets: slide.categoryBullets,
        urgencyLevel: "medium",
        rating: 5,
        textPosition: "center",
        overlayOpacity: 0.3,
      };
    case "OFFER":
      return {
        ...baseValues,
        offerLabel: slide.offerLabel,
        offerEndsAt: slide.offerEndsAt,
        promoCode: slide.promoCode || "",
        urgencyLevel: "medium",
        rating: 5,
        textPosition: "center",
        overlayOpacity: 0.3,
      };
    case "TESTIMONIAL":
      return {
        ...baseValues,
        quote: slide.quote,
        authorName: slide.authorName,
        rating: slide.rating,
        testimonialStats: slide.stats || [],
        urgencyLevel: "medium",
        textPosition: "center",
        overlayOpacity: 0.3,
      };
    case "LANDSCAPE_IMAGE":
      return {
        ...baseValues,
        subtitle: slide.subtitle || "",
        textPosition: slide.textPosition || "center",
        overlayOpacity: slide.overlayOpacity || 0.3,
        urgencyLevel: "medium",
        rating: 5,
      };
    default:
      return {
        ...baseValues,
        urgencyLevel: "medium",
        rating: 5,
        textPosition: "center",
        overlayOpacity: 0.3,
      };
  }
}

// Convert form values back to HeroSlide
export function fromFormValues(values: HeroSlideFormValues): HeroSlide {
  const baseSlide: BaseHeroSlide = {
    id: crypto.randomUUID(), // Generate temporary ID for form preview
    type: values.type,
    priority: values.priority,
    isActive: values.isActive,
    startsAt: values.startsAt || undefined,
    endsAt: values.endsAt || undefined,
    badgeText: values.badgeText || undefined,
    headline: values.headline,
    highlight: values.highlight || undefined,
    description: values.description,
    ctaPrimary: {
      label: values.ctaPrimaryLabel,
      href: values.ctaPrimaryHref,
    },
    ctaSecondary:
      values.ctaSecondaryLabel && values.ctaSecondaryHref
        ? {
            label: values.ctaSecondaryLabel,
            href: values.ctaSecondaryHref,
          }
        : undefined,
    media: {
      kind: values.mediaKind,
      productSlug:
        values.mediaKind === "product" ? values.mediaProductSlug : undefined,
      imageUrl: values.mediaKind === "image" ? values.mediaImageUrl : undefined,
      alt: values.mediaAlt || undefined,
      position: values.mediaPosition,
      aspect: values.mediaAspect,
    },
    theme: values.themeAccentToken
      ? {
          accentToken: values.themeAccentToken,
        }
      : undefined,
  };

  // Add type-specific fields
  switch (values.type) {
    case "CATEGORY_SPOTLIGHT":
      return {
        ...baseSlide,
        type: "CATEGORY_SPOTLIGHT",
        categoryBullets: values.categoryBullets!,
      };
    case "OFFER":
      return {
        ...baseSlide,
        type: "OFFER",
        offerLabel: values.offerLabel!,
        offerEndsAt: values.offerEndsAt!,
        promoCode: values.promoCode || undefined,
        // urgencyLevel and dealPills will be added to types later
      };
    case "TESTIMONIAL":
      return {
        ...baseSlide,
        type: "TESTIMONIAL",
        quote: values.quote!,
        authorName: values.authorName!,
        rating: values.rating!,
        stats: values.testimonialStats,
      };
    case "LANDSCAPE_IMAGE":
      return {
        ...baseSlide,
        type: "LANDSCAPE_IMAGE",
        subtitle: values.subtitle || undefined,
        textPosition: values.textPosition,
        overlayOpacity: values.overlayOpacity,
        media: {
          kind: "image",
          imageUrl: values.mediaImageUrl,
          alt: values.mediaAlt || undefined,
          position: values.mediaPosition,
        },
      } as LandscapeImageSlide;
    default:
      return baseSlide as HeroSlide;
  }
}
