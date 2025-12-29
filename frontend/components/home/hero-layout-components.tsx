import { ReactNode } from "react";
import Image from "next/image";
import { getProductImageWithPlaceholder } from "@/lib/utils";
import type { Product } from "@/features/products/types";
import type { HeroSlide } from "@/lib/types/heroSlides.types";

// Shared layout component for two-column hero slides
interface HeroTwoColLayoutProps {
  children: [ReactNode, ReactNode]; // [leftContent, rightContent]
}

export function HeroTwoColLayout({ children }: HeroTwoColLayoutProps) {
  const [leftContent, rightContent] = children;

  return (
    <div className="w-full min-h-[70svh] grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12 xl:gap-20 px-5 py-6 lg:px-14 lg:py-8">
      {/* Left: Hero Content */}
      <div className="flex flex-col justify-center space-y-5 min-w-0 order-1 lg:order-1 text-center lg:text-left">
        {leftContent}
      </div>

      {/* Right: Media Display */}
      <div className="w-full h-full flex items-center justify-center min-w-0 order-2 lg:order-2">
        {rightContent}
      </div>
    </div>
  );
}

// Shared media frame component with optional floating badge
interface HeroMediaFrameProps {
  slide: HeroSlide;
  product?: Product;
  isActive?: boolean;
  floatingBadge?: ReactNode;
}

export function HeroMediaFrame({
  slide,
  product,
  isActive = false,
  floatingBadge,
}: HeroMediaFrameProps) {
  return (
    <div className="relative w-full max-w-[560px] aspect-16/10 lg:aspect-square group">
      {/* Simplified Media Container */}
      <div className="rounded-3xl bg-white border border-border shadow-xl overflow-hidden">
        {slide.media.kind === "product" && product ? (
          <Image
            src={getProductImageWithPlaceholder(product)}
            alt={slide.media.alt || product.name}
            fill
            className="object-contain sm:object-cover transition-all duration-700 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 33vw"
            priority={isActive}
          />
        ) : slide.media.kind === "image" && slide.media.imageUrl ? (
          <Image
            src={slide.media.imageUrl}
            alt={slide.media.alt || ""}
            fill
            className="object-contain sm:object-cover transition-all duration-700 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 33vw"
            priority={isActive}
          />
        ) : null}
      </div>

      {/* Optional floating badge */}
      {floatingBadge && (
        <div className="absolute top-4 right-4 z-30">{floatingBadge}</div>
      )}
    </div>
  );
}
