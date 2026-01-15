import { memo, Component, ReactNode } from "react";
import dynamic from "next/dynamic";
import type {
  HeroSlide,
  LandscapeImageSlide,
  EditorsPickSlide,
  ComparisonBattleSlide,
} from "@/lib/types/heroSlides.types";
import type { Product, Category } from "@/features/products/types";
import { logger } from "@/lib/logger";
import {
  LandscapeSlideSkeleton,
  ProductSlideSkeleton,
  TestimonialSlideSkeleton,
  ComparisonBattleSlideSkeleton,
  GenericSlideSkeleton,
} from "./shared/slide-skeletons";

/**
 * Error boundary for dynamic slide imports
 * Shows a fallback skeleton if component fails to load
 */
class SlideErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    logger.error("Slide component failed to load:", { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Code-split slide body components with next/dynamic
// Product Spotlight is preloaded as it's often the first slide type
const ProductSpotlightSlideBody = dynamic(
  () => import("./slide-bodies/ProductSpotlightSlideBody"),
  {
    ssr: false,
    loading: () => <ProductSlideSkeleton />,
  }
);

const OfferSlideBody = dynamic(() => import("./slide-bodies/OfferSlideBody"), {
  ssr: false,
  loading: () => <ProductSlideSkeleton />,
});

const TestimonialSlideBody = dynamic(
  () => import("./slide-bodies/TestimonialSlideBody"),
  {
    ssr: false,
    loading: () => <TestimonialSlideSkeleton />,
  }
);

const LandscapeHeroSlideBody = dynamic(
  () => import("./slide-bodies/LandscapeHeroSlideBody"),
  {
    ssr: false,
    loading: () => <LandscapeSlideSkeleton />,
  }
);

const CategorySpotlightSlideBody = dynamic(
  () => import("./slide-bodies/CategorySpotlightSlideBody"),
  {
    ssr: false,
    loading: () => <GenericSlideSkeleton />,
  }
);

const EditorsPickSlideBody = dynamic(
  () => import("./slide-bodies/EditorsPickSlideBody"),
  {
    ssr: false,
    loading: () => <GenericSlideSkeleton />,
  }
);

const ComparisonBattleSlideBody = dynamic(
  () => import("./slide-bodies/ComparisonBattleSlideBody"),
  {
    ssr: false,
    loading: () => <ComparisonBattleSlideSkeleton />,
  }
);

interface SlideBodyRendererProps {
  slide: HeroSlide;
  product?: Product;
  productsBySlug?: Record<string, Product> | Map<string, Product>;
  category?: Category;
  categories?: Category[];
  productsByCategory?: Record<string, Product[]>;
  isActive?: boolean;
  index?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  leftProduct?: Product;
  rightProduct?: Product;
}

export const SlideBodyRenderer = memo(function SlideBodyRenderer({
  slide,
  product,
  productsBySlug,
  category,
  categories = [],
  productsByCategory = {},
  isActive = false,
  index = 0,
  onMouseEnter,
  onMouseLeave,
  leftProduct,
  rightProduct,
}: SlideBodyRendererProps) {
  return (
    <>
      <SlideErrorBoundary fallback={<GenericSlideSkeleton />}>
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

            case "CATEGORY_SPOTLIGHT":
              return (
                <CategorySpotlightSlideBody
                  slide={slide}
                  category={category}
                  categories={categories}
                  productsByCategory={productsByCategory}
                  isActive={isActive}
                  index={index}
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                />
              );

            case "EDITORS_PICK":
              return (
                <EditorsPickSlideBody
                  slide={slide as EditorsPickSlide}
                  productsBySlug={productsBySlug}
                  isActive={isActive}
                  index={index}
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                />
              );

            case "COMPARISON_BATTLE":
              return (
                <ComparisonBattleSlideBody
                  slide={slide as ComparisonBattleSlide}
                  leftProduct={leftProduct}
                  rightProduct={rightProduct}
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
      </SlideErrorBoundary>
    </>
  );
});
