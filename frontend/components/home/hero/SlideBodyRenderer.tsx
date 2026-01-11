import { memo } from "react";
import dynamic from "next/dynamic";
import type {
  HeroSlide,
  LandscapeImageSlide,
} from "@/lib/types/heroSlides.types";
import type { Product } from "@/features/products/types";
import { logger } from "@/lib/logger";

// Code-split slide body components with next/dynamic
const ProductSpotlightSlideBody = dynamic(
  () =>
    import("./slide-bodies/ProductSpotlightSlideBody").then((mod) => ({
      default: mod.ProductSpotlightSlideBody,
    })),
  {
    ssr: false,
    loading: () => <div className="w-full h-full" />,
  }
);

const CategorySpotlightSlideBody = dynamic(
  () =>
    import("./slide-bodies/CategorySpotlightSlideBody").then((mod) => ({
      default: mod.CategorySpotlightSlideBody,
    })),
  {
    ssr: false,
    loading: () => <div className="w-full h-full" />,
  }
);

const OfferSlideBody = dynamic(
  () =>
    import("./slide-bodies/OfferSlideBody").then((mod) => ({
      default: mod.OfferSlideBody,
    })),
  {
    ssr: false,
    loading: () => <div className="w-full h-full" />,
  }
);

const TestimonialSlideBody = dynamic(
  () =>
    import("./slide-bodies/TestimonialSlideBody").then((mod) => ({
      default: mod.TestimonialSlideBody,
    })),
  {
    ssr: false,
    loading: () => <div className="w-full h-full" />,
  }
);

const LandscapeHeroSlideBody = dynamic(
  () =>
    import("./slide-bodies/LandscapeHeroSlideBody").then((mod) => ({
      default: mod.LandscapeHeroSlideBody,
    })),
  {
    ssr: false,
    loading: () => <div className="w-full h-full" />,
  }
);

interface SlideBodyRendererProps {
  slide: HeroSlide;
  product?: Product;
  isActive?: boolean;
  index?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const SlideBodyRenderer = memo(function SlideBodyRenderer({
  slide,
  product,
  isActive = false,
  index = 0,
  onMouseEnter,
  onMouseLeave,
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
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              />
            );

          case "CATEGORY_SPOTLIGHT":
            return (
              <CategorySpotlightSlideBody
                slide={slide}
                product={product}
                isActive={isActive}
                index={index}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              />
            );

          case "OFFER":
            return (
              <OfferSlideBody
                slide={slide}
                product={product}
                isActive={isActive}
                index={index}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              />
            );

          case "TESTIMONIAL":
            return (
              <TestimonialSlideBody
                slide={slide}
                product={product}
                isActive={isActive}
                index={index}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              />
            );

          case "LANDSCAPE_IMAGE":
            return (
              <LandscapeHeroSlideBody
                slide={slide as LandscapeImageSlide}
                isActive={isActive}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              />
            );

          default:
            // Dev-only visible error box for unknown slide types - never fail silently
            const unknownSlide = slide as HeroSlide;
            logger.error(
              `SlideBodyRenderer: Unknown slide type "${unknownSlide.type}" for slide "${unknownSlide.id}". This should never happen in production.`
            );
            return process.env.NODE_ENV === "development" ? (
              <div className="w-full h-full flex items-center justify-center bg-red-500 text-white p-8 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">
                    Unknown Slide Type
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
