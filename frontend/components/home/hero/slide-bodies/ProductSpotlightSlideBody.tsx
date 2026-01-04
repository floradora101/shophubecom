import { memo } from "react";
import { Sparkles, Zap, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { HeroMediaFrame } from "../shared/hero-media-frame";
import { HeroPriceBlock } from "../../shared/hero-price-block";
import { ThemedBadge } from "../../shared/themed-badge";
import { ThemedSecondaryButton } from "../../shared/themed-secondary-button";
import { ThemedTrustRow } from "../../shared/themed-trust-row";
import { SlideLayout, contentClamp } from "../shared/slide-layout";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import type { Product } from "@/features/products/types";

interface ProductSpotlightSlideBodyProps {
  slide: HeroSlide & { type: "PRODUCT_SPOTLIGHT" };
  product?: Product;
  isActive: boolean;
  index: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const ProductSpotlightSlideBody = memo(
  function ProductSpotlightSlideBody({
    slide,
    product,
    isActive,
    onMouseEnter,
    onMouseLeave,
  }: ProductSpotlightSlideBodyProps) {
    return (
      <SlideLayout
        textContent={
          <>
            {/* Row 1: Themed Badge */}
            <ThemedBadge icon={Sparkles}>
              {slide.badgeText || "Premium Product"}
            </ThemedBadge>

            {/* Row 2: Headline */}
            <div className="space-y-3">
              <h1
                className={`text-4xl lg:text-5xl font-black leading-tight underline decoration-2 underline-offset-4 ${contentClamp.headline}`}
                style={{ color: "var(--hero-text)" }}
              >
                {slide.headline}
              </h1>
              {slide.highlight && (
                <h2
                  className="text-2xl lg:text-3xl font-bold overline decoration-1"
                  style={{ color: "var(--hero-accent)" }}
                >
                  {slide.highlight}
                </h2>
              )}
            </div>

            {/* Row 3: Description */}
            <p
              className={`text-lg leading-relaxed ${contentClamp.description}`}
              style={{ color: "var(--hero-muted)" }}
            >
              {slide.description}
            </p>

            {/* Row 4: Flexible middle space (Product Name, Price, Specs) */}
            <div className="space-y-8">
              {product && (
                <h3
                  className="text-2xl font-bold"
                  style={{ color: "var(--hero-text)" }}
                >
                  {product.name}
                </h3>
              )}
              {product && <HeroPriceBlock product={product} />}
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
            </div>

            {/* Row 5: CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href={slide.ctaPrimary.href}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              >
                <Button className="group w-auto">
                  <span className="flex items-center gap-2">
                    {slide.ctaPrimary.label}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
              {slide.ctaSecondary && (
                <ThemedSecondaryButton
                  label={slide.ctaSecondary.label}
                  href={slide.ctaSecondary.href}
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                />
              )}
            </div>

            {/* Row 6: Trust Row */}
            <ThemedTrustRow
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
