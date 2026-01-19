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
    "CATEGORY_SPOTLIGHT",
    "EDITORS_PICK",
    "COMPARISON_BATTLE",
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

  // CATEGORY_SPOTLIGHT
  categorySlug: z.string().optional().or(z.literal("")),
  categoryBullets: z.array(z.string().min(1).max(50)).max(3).optional().default([]),

  // EDITORS_PICK
  editorNote: z.string().max(300).optional().or(z.literal("")),
  productSlugs: z.string().optional().or(z.literal("")), // Comma separated for form input

  // COMPARISON_BATTLE
  leftProductSlug: z.string().optional().or(z.literal("")),
  rightProductSlug: z.string().optional().or(z.literal("")),
  comparisonPoints: z.string().optional().or(z.literal("")), // Comma separated for form input
});

export const HeroSlideFormSchema = baseHeroSlideSchema;

export type HeroSlideFormValues = z.infer<typeof HeroSlideFormSchema>;

export function getDefaultHeroSlideFormValues(type?: HeroSlideType): HeroSlideFormValues {
  const selectedType = type || "PRODUCT_SPOTLIGHT";
  return {
    type: selectedType,
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
    mediaKind: selectedType === "PRODUCT_SPOTLIGHT" ? "product" : "none",
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
    categorySlug: "",
    categoryBullets: [],
    editorNote: "",
    productSlugs: "",
    leftProductSlug: "",
    rightProductSlug: "",
    comparisonPoints: "",
  };
}

export function toFormValues(slide: HeroSlide): HeroSlideFormValues {
  const baseValues = {
    type: slide.type,
    priority: slide.priority,
    isActive: slide.isActive,
    startsAt: slide.startsAt || "",
    endsAt: slide.endsAt || "",
    badgeText: slide.type === "LANDSCAPE_IMAGE" ? "" : slide.badgeText || "",
    headline: slide.type === "LANDSCAPE_IMAGE" ? slide.content.headline : slide.headline || "",
    highlight: slide.type === "LANDSCAPE_IMAGE" ? slide.content.highlight : slide.highlight || "",
    description: slide.type === "LANDSCAPE_IMAGE" ? slide.content.description : slide.description || "",
    ctaPrimaryLabel: slide.type === "LANDSCAPE_IMAGE" ? slide.actionButton.label : slide.ctaPrimary.label,
    ctaPrimaryHref: slide.type === "LANDSCAPE_IMAGE" ? slide.actionButton.href : slide.ctaPrimary.href,
    mediaKind: slide.media.kind,
    mediaProductSlug: "productSlug" in slide.media ? slide.media.productSlug || "" : "",
    mediaImageUrl: "imageUrl" in slide.media ? slide.media.imageUrl || "" : "",
    mediaAlt: "alt" in slide.media ? slide.media.alt || "" : "",
    mediaPosition: "position" in slide.media ? slide.media.position || "center" : "center",
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
  } else if (slide.type === "CATEGORY_SPOTLIGHT") {
    (otherValues as any).categorySlug = slide.categorySlug;
    (otherValues as any).categoryBullets = slide.categoryBullets || [];
  } else if (slide.type === "EDITORS_PICK") {
    (otherValues as any).editorNote = slide.editorNote;
    (otherValues as any).productSlugs = slide.productSlugs.join(", ");
  } else if (slide.type === "COMPARISON_BATTLE") {
    (otherValues as any).leftProductSlug = slide.leftProductSlug;
    (otherValues as any).rightProductSlug = slide.rightProductSlug;
    (otherValues as any).comparisonPoints = (slide.comparisonPoints || [])
      .map((p) => `${p.label}|${p.leftValue}|${p.rightValue}`)
      .join(", ");
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
    case "CATEGORY_SPOTLIGHT":
      return {
        ...baseSlide,
        type: "CATEGORY_SPOTLIGHT",
        categorySlug: values.categorySlug || "",
        categoryBullets: values.categoryBullets || [],
        media: { kind: "none" },
      };
    case "EDITORS_PICK":
      return {
        ...baseSlide,
        type: "EDITORS_PICK",
        editorNote: values.editorNote || "",
        productSlugs: (values.productSlugs || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        media: { kind: "none" },
      };
    case "COMPARISON_BATTLE":
      return {
        ...baseSlide,
        type: "COMPARISON_BATTLE",
        leftProductSlug: values.leftProductSlug || "",
        rightProductSlug: values.rightProductSlug || "",
        comparisonPoints: (values.comparisonPoints || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((point) => {
            const [label, leftValue, rightValue] = point.split("|");
            return {
              label: label || "",
              leftValue: leftValue || "",
              rightValue: rightValue || "",
            };
          }),
        media: { kind: "none" },
      };
    default:
      return baseSlide as HeroSlide;
  }
}
