import { useMemo } from "react";
import { getHeroAccentClasses, type HeroTheme } from "@/lib/ui-tokens";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import type { Product } from "@/features/products/types";

// Import individual slide components
import { ProductSpotlightSlide } from "./slides/product-spotlight-slide";
import { CategorySpotlightSlide } from "./slides/category-spotlight-slide";
import { OfferSlide } from "./slides/offer-slide";
import { TestimonialSlide } from "./slides/testimonial-slide";
import { LandscapeHeroSlide } from "./slides/landscape-hero-slide";

interface HeroSlideRendererProps {
  slide: HeroSlide;
  product?: Product; // Optional product data if slide references one
  isActive?: boolean; // Whether this slide is currently active/visible
}

export function HeroSlideRenderer({
  slide,
  product,
  isActive = false,
}: HeroSlideRendererProps) {
  const accentClasses = useMemo(() => {
    // Use new theme system directly
    const token = slide.theme?.accentToken;
    let theme: HeroTheme = "primary";

    switch (token) {
      case "secondary":
        theme = "secondary";
        break;
      case "blue":
        theme = "blue";
        break;
      case "success":
        theme = "success";
        break;
      case "warning":
        theme = "warning";
        break;
      case "cream":
        theme = "cream";
        break;
      case "primary":
      default:
        theme = "primary";
        break;
    }

    return getHeroAccentClasses(theme);
  }, [slide.theme?.accentToken]);

  switch (slide.type) {
    case "PRODUCT_SPOTLIGHT":
      return (
        <ProductSpotlightSlide
          slide={slide}
          product={product}
          accentClasses={accentClasses}
          isActive={isActive}
        />
      );

    case "CATEGORY_SPOTLIGHT":
      return (
        <CategorySpotlightSlide
          slide={slide}
          accentClasses={accentClasses}
          isActive={isActive}
        />
      );

    case "OFFER":
      return (
        <OfferSlide
          slide={slide}
          accentClasses={accentClasses}
          isActive={isActive}
        />
      );

    case "TESTIMONIAL":
      return (
        <TestimonialSlide
          slide={slide}
          accentClasses={accentClasses}
          isActive={isActive}
        />
      );

    case "LANDSCAPE_HERO":
      return (
        <LandscapeHeroSlide
          slide={slide}
          accentClasses={accentClasses}
          isActive={isActive}
        />
      );

    default:
      return null;
  }
}
