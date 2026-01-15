import { ReactNode, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { getProductImageWithPlaceholder } from "@/lib/utils";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import type { Product } from "@/features/products/types";

interface VideoElement extends HTMLVideoElement {
  play(): Promise<void>;
}

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
  const videoRef = useRef<VideoElement | null>(null);

  // Priority: only active slide gets priority
  const shouldPrioritize = isActive;

  // 1 Prefetch next slide image when this slide becomes active
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

  // Video autoplay effect
  useEffect(() => {
    if (
      slide.media.kind === "video" &&
      "videoUrl" in slide.media &&
      slide.media.videoUrl &&
      videoRef.current
    ) {
      if (isActive) {
        // Attempt to play video with proper error handling
        videoRef.current.play().catch(() => {
          // Silently handle autoplay failures (common in browsers)
        });
      } else {
        // Pause when not active
        videoRef.current.pause();
      }
    }
  }, [isActive, slide.media]);

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
          className="relative w-full h-full min-h-0 rounded-lg overflow-hidden border ring-1 shadow-xl"
          style={{
            borderColor: "rgba(250, 6, 3, 0.18)",
            boxShadow:
              "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 10px 10px -5px rgb(0 0 0 / 0.04)",
          }}
        >
          {/* background gradient UNDER image - neutral radial highlight */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 70% 30%, rgba(0,0,0,0.08) 0%, transparent 50%)",
            }}
          />

          {/* tiny accent glow as corner blob */}
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-60"
            style={{
              background:
                "radial-gradient(circle, #fa0603 0%, transparent 70%)",
              transform: "translate(50%, -50%)",
            }}
          />

          {/* inner surface */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.18)" }}
          />

          {/* image */}
          {slide.media.kind === "product" && product ? (
            <div className="absolute inset-0 p-4 sm:p-8">
              <Image
                src={getProductImageWithPlaceholder(product)}
                alt={slide.media.alt || product.name}
                fill
                className={cn(
                  "relative z-10 object-contain transition-transform duration-2000 ease-out",
                  "sm:scale-[1.06] sm:group-hover:scale-110 scale-100 group-hover:scale-100",
                  getObjectPositionClass(slide.media.position || "center")
                )}
                priority={shouldPrioritize}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ) : slide.media.kind === "image" && slide.media.imageUrl ? (
            <div className="absolute inset-0">
              <Image
                key={slide.media.imageUrl}
                src={slide.media.imageUrl}
                alt={slide.media.alt || "Hero image"}
                fill
                className={cn(
                  "relative z-10 object-cover transition-transform duration-3000 ease-out",
                  "sm:group-hover:scale-110 sm:group-hover:rotate-1 scale-100 group-hover:scale-100 group-hover:rotate-0",
                  getObjectPositionClass(slide.media.position)
                )}
                priority={shouldPrioritize}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ) : slide.media.kind === "video" &&
            "videoUrl" in slide.media &&
            slide.media.videoUrl ? (
            <div className="absolute inset-0">
              <video
                ref={videoRef}
                src={slide.media.videoUrl}
                className={cn(
                  "relative z-10 w-full h-full object-cover transition-transform duration-3000 ease-out",
                  "sm:group-hover:scale-110 scale-100 group-hover:scale-100",
                  getObjectPositionClass(slide.media.position)
                )}
                muted
                playsInline
                loop
                preload={shouldPrioritize ? "metadata" : "none"}
                poster={slide.media.imageUrl}
                aria-label={slide.media.alt || "Hero video background"}
              />
            </div>
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
