import { memo } from "react";
import type {
  HeroSlide,
  LandscapeImageSlide,
} from "@/lib/types/heroSlides.types";
import type { Product } from "@/features/products/types";

// Import individual slide body components
import { ProductSpotlightSlideBody } from "./slide-bodies/ProductSpotlightSlideBody";
import { CategorySpotlightSlideBody } from "./slide-bodies/CategorySpotlightSlideBody";
import { OfferSlideBody } from "./slide-bodies/OfferSlideBody";
import { TestimonialSlideBody } from "./slide-bodies/TestimonialSlideBody";
import { LandscapeHeroSlideBody } from "./slide-bodies/LandscapeHeroSlideBody";

interface SlideBodyRendererProps {
  slide: HeroSlide;
  product?: Product;
  isActive?: boolean;
  index?: number;
}

export const SlideBodyRenderer = memo(function SlideBodyRenderer({
  slide,
  product,
  isActive = false,
  index = 0,
}: SlideBodyRendererProps) {
  return (
    <>
      {(() => {
        switch (slide.type) {
          case "PRODUCT_SPOTLIGHT":
            return (
              <ProductSpotlightSlideBody
                slide={slide}
                product={product}
                isActive={isActive}
                index={index}
              />
            );

          case "CATEGORY_SPOTLIGHT":
            return (
              <CategorySpotlightSlideBody
                slide={slide}
                isActive={isActive}
                index={index}
              />
            );

          case "OFFER":
            return (
              <OfferSlideBody slide={slide} isActive={isActive} index={index} />
            );

          case "TESTIMONIAL":
            return (
              <TestimonialSlideBody
                slide={slide}
                isActive={isActive}
                index={index}
              />
            );

          case "LANDSCAPE_IMAGE":
            return (
              <LandscapeHeroSlideBody
                slide={slide as LandscapeImageSlide}
                isActive={isActive}
              />
            );

          default:
            // Dev-only visible error box for unknown slide types - never fail silently
            const unknownSlide = slide as HeroSlide;
            console.error(
              `SlideBodyRenderer: Unknown slide type "${unknownSlide.type}" for slide "${unknownSlide.id}". This should never happen in production.`
            );
            return process.env.NODE_ENV === "development" ? (
              <div className="w-full h-full flex items-center justify-center bg-red-500 text-white p-8 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">
                    🚨 Unknown Slide Type
                  </div>
                  <div className="text-lg">
                    Type: &quot;{unknownSlide.type}&quot;
                  </div>
                  <div className="text-sm mt-2">
                    Slide ID: {unknownSlide.id}
                  </div>
                </div>
              </div>
            ) : null;
        }
      })()}
    </>
  );
});
