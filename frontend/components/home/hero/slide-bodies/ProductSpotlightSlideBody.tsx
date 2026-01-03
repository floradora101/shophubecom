import { memo } from "react";
import { Sparkles, Zap, Shield, Star } from "lucide-react";
import { Price } from "@/components/ui/price";
import { HeroCTAs } from "../../shared/hero-ctas";
import { HeroTrustRow } from "../../shared/hero-trust-row";
import { HeroMediaFrame } from "../shared/hero-media-frame";
import { SlideLayout, contentClamp } from "../shared/slide-layout";
import { useHeroPricing } from "@/lib/hooks/use-hero-pricing";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import type { Product } from "@/features/products/types";

interface ProductSpotlightSlideBodyProps {
  slide: HeroSlide & { type: "PRODUCT_SPOTLIGHT" };
  product?: Product;
  isActive: boolean;
  index: number;
}

export const ProductSpotlightSlideBody = memo(
  function ProductSpotlightSlideBody({
    slide,
    product,
    isActive,
    index,
  }: ProductSpotlightSlideBodyProps) {
    const pricing = useHeroPricing(product);
    const { currentPrice, originalPrice, discountPercent, hasDiscount } =
      pricing;

    return (
      <SlideLayout
        textContent={
          <>
            {/* Editorial Badge */}
            <div className="hero-badge inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>{slide.badgeText || "Premium Product"}</span>
            </div>

            {/* Headline with accent underline */}
            <div className="space-y-3">
              <h1
                className={`text-4xl lg:text-5xl font-black leading-tight ${contentClamp.headline}`}
                style={{ color: "var(--hero-text)" }}
              >
                {slide.headline}
              </h1>
              {slide.highlight && (
                <h2
                  className="text-2xl lg:text-3xl font-bold relative"
                  style={{ color: "var(--hero-text)" }}
                >
                  {slide.highlight}
                  <div
                    className="absolute -bottom-1 left-0 h-1 rounded-full"
                    style={{
                      backgroundColor: "var(--hero-accent)",
                      width: "60%",
                    }}
                  />
                </h2>
              )}
              <p
                className={`text-lg leading-relaxed ${contentClamp.description}`}
                style={{ color: "var(--hero-muted)" }}
              >
                {slide.description}
              </p>
            </div>

            {/* Product Name */}
            {product && (
              <h3
                className="text-2xl font-bold"
                style={{ color: "var(--hero-text)" }}
              >
                {product.name}
              </h3>
            )}

            {/* Spec Pills - Max 2, using theme vars */}
            <div className="flex gap-3">
              <div className="hero-pill flex items-center gap-2 text-sm font-medium">
                <Zap className="w-4 h-4" />
                <span>30hr Battery</span>
              </div>
              <div className="hero-pill flex items-center gap-2 text-sm font-medium">
                <Shield className="w-4 h-4" />
                <span>5 Colors</span>
              </div>
            </div>

            {/* CTAs */}
            <HeroCTAs
              primary={slide.ctaPrimary}
              secondary={slide.ctaSecondary}
            />

            {/* Trust Row */}
            <HeroTrustRow
              items={[
                { icon: Shield, text: "2-Year Warranty" },
                { icon: Star, text: "Expert Approved" },
              ]}
            />
          </>
        }
        mediaContent={
          <HeroMediaFrame
            slide={slide}
            product={product}
            isActive={isActive}
            floatingBadge={
              hasDiscount && discountPercent ? (
                <div className="px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg transform rotate-2 bg-[var(--hero-accent)] text-white">
                  -{discountPercent}% OFF
                </div>
              ) : undefined
            }
            priceOverlay={
              product ? (
                <div className="hero-card absolute bottom-6 right-6 p-6">
                  <div
                    className="text-3xl font-black mb-1"
                    style={{ color: "var(--hero-text)" }}
                  >
                    <Price amount={currentPrice} />
                  </div>
                  {hasDiscount && originalPrice && (
                    <div
                      className="text-sm line-through"
                      style={{
                        color: "var(--hero-muted)",
                        textDecorationColor: "var(--hero-accent)",
                      }}
                    >
                      <Price amount={originalPrice} />
                    </div>
                  )}
                </div>
              ) : undefined
            }
            badge={
              <div className="hero-badge px-3 py-1.5 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                FEATURED
              </div>
            }
          />
        }
      />
    );
  }
);
