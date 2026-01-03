import { ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { getProductImageWithPlaceholder } from "@/lib/utils";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import type { Product } from "@/features/products/types";

interface HeroMediaFrameProps {
  slide: HeroSlide;
  product?: Product;
  isActive?: boolean;
  floatingBadge?: ReactNode;
  priceOverlay?: ReactNode;
  badge?: ReactNode;
}

export function HeroMediaFrame({
  slide,
  product,
  isActive = false,
  floatingBadge,
  priceOverlay,
  badge,
}: HeroMediaFrameProps) {
  const prefetchRef = useRef<HTMLImageElement | null>(null);

  // Priority: only active slide gets priority
  const shouldPrioritize = isActive;

  // Prefetch next slide image when this slide becomes active
  useEffect(() => {
    if (isActive) {
      // Prefetch logic for next slide (lightweight Image() constructor)
      const prefetchNextSlide = () => {
        if (slide.media.kind === "product" && product) {
          const img = new window.Image();
          img.src = getProductImageWithPlaceholder(product);
          prefetchRef.current = img;
        } else if (slide.media.kind === "image" && slide.media.imageUrl) {
          const img = new window.Image();
          img.src = slide.media.imageUrl;
          prefetchRef.current = img;
        }
      };

      // Small delay to avoid blocking current slide load
      const timeoutId = setTimeout(prefetchNextSlide, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isActive, slide.media, product]);

  // Map media position to CSS object-position classes
  const getObjectPositionClass = (position?: string) => {
    switch (position) {
      case "top":
        return "object-top";
      case "bottom":
        return "object-bottom";
      case "left":
        return "object-left";
      case "right":
        return "object-right";
      case "center":
      default:
        return "object-center";
    }
  };

  return (
    <div className="relative h-full w-full">
      <div className="h-full w-full">
        <div
          className="relative w-full h-full min-h-0 rounded-3xl overflow-hidden border ring-1 shadow-xl"
          style={{
            borderColor: "var(--hero-border)",
            boxShadow:
              "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 10px 10px -5px rgb(0 0 0 / 0.04)",
          }}
        >
          {/* background gradient UNDER image */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, var(--hero-bg-from), rgba(255,255,255,0) 45%, var(--hero-bg-to))",
              opacity: 0.35,
            }}
          />

          {/* inner surface */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.18)" }}
          />

          {/* image */}
          {slide.media.kind === "product" && product ? (
            <div className="absolute inset-10">
              <img
                src={getProductImageWithPlaceholder(product)}
                alt={slide.media.alt || product.name}
                className={cn(
                  "relative z-10 w-full h-full object-contain scale-[1.06] group-hover:scale-[1.1] transition-transform duration-700 ease-out",
                  getObjectPositionClass(slide.media.position)
                )}
                loading={shouldPrioritize ? "eager" : "lazy"}
              />
            </div>
          ) : slide.media.kind === "image" && slide.media.imageUrl ? (
            <img
              src={slide.media.imageUrl}
              alt={slide.media.alt || ""}
              className={cn(
                "relative z-10 w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]",
                getObjectPositionClass(slide.media.position)
              )}
              loading={shouldPrioritize ? "eager" : "lazy"}
            />
          ) : null}
        </div>
      </div>

      {priceOverlay && (
        <div className="absolute bottom-6 right-6 z-20">{priceOverlay}</div>
      )}
      {badge && <div className="absolute top-4 left-4 z-20">{badge}</div>}
      {floatingBadge && (
        <div className="absolute top-4 right-4 z-20">{floatingBadge}</div>
      )}
    </div>
  );
}
