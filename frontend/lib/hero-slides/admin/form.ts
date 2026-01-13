import { z } from "zod";
import type {
  HeroSlide,
  HeroSlideType,
  BaseHeroSlide,
  LandscapeImageSlide,
  LandscapeTheme,
} from "@/lib/types/heroSlides.types";

// Base schema for common fields
const baseHeroSlideSchema = z.object({
  // Basic fields
  type: z.enum([
    "PRODUCT_SPOTLIGHT",
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
  badgeText: z.string().max(30).optional().or(z.literal("")),
  headline: z.string().min(1, "Headline is required").max(80),
  highlight: z.string().max(60).optional().or(z.literal("")),
  description: z.string().min(1, "Description is required").max(200),

  // CTA
  ctaPrimaryLabel: z.string().min(1, "Primary CTA label is required").max(20),
  ctaPrimaryHref: z.string().min(1, "Primary CTA link is required"),
  ctaSecondaryLabel: z.string().max(20).optional().or(z.literal("")),
  ctaSecondaryHref: z.string().optional().or(z.literal("")),

  // Media
  mediaKind: z.enum(["product", "image", "video", "none"]),
  mediaProductSlug: z.string().optional().or(z.literal("")),
  mediaImageUrl: z.string().optional().or(z.literal("")),
  mediaAlt: z.string().max(200).optional().or(z.literal("")),
  mediaPosition: z.enum(["center", "top", "bottom", "left", "right"]).optional(),
  mediaAspect: z.enum(["landscape", "default"]).optional(),

  // OFFER
  offerLabel: z.string().min(1).max(30).optional().or(z.literal("")),
  offerEndsAt: z.string().optional().or(z.literal("")),
  promoCode: z.string().max(15).optional().or(z.literal("")),
  urgencyLevel: z.enum(["low", "medium", "high"]).optional().default("medium"),
  dealPills: z.array(z.string().min(1).max(20)).max(3).optional(),

  // TESTIMONIAL
  quote: z.string().min(1).max(200).optional().or(z.literal("")),
  authorName: z.string().min(1).max(30).optional().or(z.literal("")),
  rating: z.number().int().min(1).max(5).default(5),
  testimonialStats: z
    .array(
      z.object({
        label: z.string().min(1).max(25),
        value: z.string().min(1).max(15),
      })
    )
    .max(3)
    .optional(),

  // LANDSCAPE_IMAGE (New structure)
  landscapeTheme: z.enum(["glass-red", "minimal-white", "bold-dark", "centered-glass", "right-industrial", "clean-modern"]).default("glass-red"),
});

export const HeroSlideFormSchema = baseHeroSlideSchema;

export type HeroSlideFormValues = z.infer<typeof HeroSlideFormSchema>;

export function getDefaultHeroSlideFormValues(type?: HeroSlideType): HeroSlideFormValues {
  return {
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
    offerLabel: "",
    offerEndsAt: "",
    promoCode: "",
    urgencyLevel: "medium",
    dealPills: [],
    quote: "",
    authorName: "",
    rating: 5,
    testimonialStats: [],
    landscapeTheme: "glass-red",
  };
}

export function toFormValues(slide: HeroSlide): HeroSlideFormValues {
  const baseValues = {
    type: slide.type,
    priority: slide.priority,
    isActive: slide.isActive,
    startsAt: slide.startsAt || "",
    endsAt: slide.endsAt || "",
    badgeText: slide.badgeText || "",
    headline: slide.headline || (slide.type === "LANDSCAPE_IMAGE" ? slide.content.headline : ""),
    highlight: slide.highlight || (slide.type === "LANDSCAPE_IMAGE" ? slide.content.highlight : ""),
    description: slide.description || (slide.type === "LANDSCAPE_IMAGE" ? slide.content.description : ""),
    ctaPrimaryLabel: slide.type === "LANDSCAPE_IMAGE" ? slide.actionButton.label : slide.ctaPrimary.label,
    ctaPrimaryHref: slide.type === "LANDSCAPE_IMAGE" ? slide.actionButton.href : slide.ctaPrimary.href,
    ctaSecondaryLabel: slide.type === "LANDSCAPE_IMAGE" ? "" : slide.ctaSecondary?.label || "",
    ctaSecondaryHref: slide.type === "LANDSCAPE_IMAGE" ? "" : slide.ctaSecondary?.href || "",
    mediaKind: slide.media.kind,
    mediaProductSlug: "productSlug" in slide.media ? slide.media.productSlug || "" : "",
    mediaImageUrl: slide.media.imageUrl || "",
    mediaAlt: slide.media.alt || "",
    mediaPosition: slide.media.position || "center",
    mediaAspect: "aspect" in slide.media ? slide.media.aspect || "default" : "default",
  };

  if (slide.type === "LANDSCAPE_IMAGE") {
    return {
      ...baseValues,
      badgeText: slide.content.badge,
      landscapeTheme: slide.theme,
    } as HeroSlideFormValues;
  }

  // Handle other types...
  const otherValues = { ...baseValues };
  if (slide.type === "OFFER") {
    (otherValues as any).offerLabel = slide.offerLabel;
    (otherValues as any).offerEndsAt = slide.offerEndsAt;
    (otherValues as any).promoCode = slide.promoCode;
  } else if (slide.type === "TESTIMONIAL") {
    (otherValues as any).quote = slide.quote;
    (otherValues as any).authorName = slide.authorName;
    (otherValues as any).rating = slide.rating;
    (otherValues as any).testimonialStats = slide.stats;
  }

  return otherValues as HeroSlideFormValues;
}

export function fromFormValues(values: HeroSlideFormValues, existingId?: string): HeroSlide {
  const id = existingId || crypto.randomUUID();

  if (values.type === "LANDSCAPE_IMAGE") {
    return {
      id,
      type: "LANDSCAPE_IMAGE",
      priority: values.priority,
      isActive: values.isActive,
      startsAt: values.startsAt || undefined,
      endsAt: values.endsAt || undefined,
      theme: values.landscapeTheme as LandscapeTheme,
      content: {
        badge: values.badgeText || "",
        headline: values.headline,
        highlight: values.highlight || "",
        description: values.description,
      },
      media: {
        kind: "image",
        imageUrl: values.mediaImageUrl || "",
        alt: values.mediaAlt || "",
        position: values.mediaPosition,
      },
      actionButton: {
        label: values.ctaPrimaryLabel,
        href: values.ctaPrimaryHref,
      },
    } as LandscapeImageSlide;
  }

  // Base for other types
  const baseSlide: BaseHeroSlide = {
    id,
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
    ctaSecondary: values.ctaSecondaryLabel ? {
      label: values.ctaSecondaryLabel,
      href: values.ctaSecondaryHref || "",
    } : undefined,
    media: {
      kind: values.mediaKind,
      productSlug: values.mediaProductSlug || undefined,
      imageUrl: values.mediaImageUrl || undefined,
      alt: values.mediaAlt || undefined,
      position: values.mediaPosition,
      aspect: values.mediaAspect,
    },
  };

  switch (values.type) {
    case "OFFER":
      return {
        ...baseSlide,
        type: "OFFER",
        offerLabel: values.offerLabel || "",
        offerEndsAt: values.offerEndsAt || "",
        promoCode: values.promoCode,
      };
    case "TESTIMONIAL":
      return {
        ...baseSlide,
        type: "TESTIMONIAL",
        quote: values.quote || "",
        authorName: values.authorName || "",
        rating: values.rating,
        stats: values.testimonialStats,
      };
    default:
      return baseSlide as HeroSlide;
  }
}
