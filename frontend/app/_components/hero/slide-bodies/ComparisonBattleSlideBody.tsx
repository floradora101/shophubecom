"use client";

import React, { memo, useState, useCallback } from "react";
import { ArrowRight, Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { HeroItem } from "../shared/hero-item";
import { useHeroRunCounter } from "@/lib/hooks/use-hero-run-counter";
import { getProductImageWithPlaceholder } from "@/lib/utils/products";
import { HeroPriceBlock } from "../../shared/HeroPriceBlock";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { SkeletonBlock } from "@/components/ui/skeleton";
import type { ComparisonBattleSlide } from "@/lib/types/heroSlides.types";
import type { Product } from "@/features/products/types";
import { productRoutes } from "@/lib/routes";
import { resolveSlidePrimaryCtaHref } from "@/lib/utils/heroSlides.utils";

interface ComparisonBattleSlideBodyProps {
  slide: ComparisonBattleSlide;
  leftProduct?: Product;
  rightProduct?: Product;
  isActive: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const ComparisonBattleSlideBody = memo(
  function ComparisonBattleSlideBody({
    slide,
    leftProduct,
    rightProduct,
    isActive,
    onMouseEnter,
    onMouseLeave,
  }: ComparisonBattleSlideBodyProps) {
    const { run, animationKey } = useHeroRunCounter(isActive);
    const [hoveredSide, setHoveredSide] = useState<"left" | "right" | null>(
      null
    );

    const handleSideHover = useCallback((side: "left" | "right" | null) => {
      setHoveredSide(side);
    }, []);

    const isLeftLoading = !leftProduct;
    const isRightLoading = !rightProduct;

    return (
      <div
        className="relative w-full h-full flex overflow-hidden group/battle select-none"
        onMouseEnter={onMouseEnter}
        onMouseLeave={() => {
          onMouseLeave?.();
          handleSideHover(null);
        }}
      >
        {/* 1. High-Tech Fluid Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Dynamic Background Split with Organic Transition */}
          <div className="absolute inset-0 flex h-full w-full">
            <div
              className={cn(
                "flex-1 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] relative",
                hoveredSide === "left"
                  ? "bg-red-600/3 flex-[1.2]"
                  : "bg-transparent flex-1"
              )}
            >
              {/* Left Decorative Mesh */}
              <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fa0603_1px,transparent_1px)] bg-size-[24px_24px]" />
            </div>

            {/* Minimalist Tech Divider */}
            <div className="relative w-px h-full bg-linear-to-b from-transparent via-red-600/20 to-transparent">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
                <div className="relative">
                  {/* Glass HUD VS */}
                  <div className="absolute inset-0 rounded-full bg-red-600/20 blur-2xl scale-[2.5] animate-pulse" />
                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-white/10 backdrop-blur-3xl border border-red-600/40 flex items-center justify-center shadow-2xl relative z-10 transition-transform duration-700 group-hover/battle:scale-110">
                    <div className="flex flex-col items-center">
                      <Target className="w-4 h-4 text-red-600 mb-0.5 animate-pulse" />
                      <span className="text-red-600 font-black text-xs tracking-[0.2em] italic">
                        VS
                      </span>
                    </div>
                    {/* Orbiting Ring */}
                    <div className="absolute inset-[-8px] border-t border-red-600/30 rounded-full animate-[spin_8s_linear_infinite]" />
                  </div>
                </div>
              </div>
            </div>

            <div
              className={cn(
                "flex-1 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] relative",
                hoveredSide === "right"
                  ? "bg-red-600/3 flex-[1.2]"
                  : "bg-transparent flex-1"
              )}
            >
              {/* Right Decorative Mesh */}
              <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fa0603_1px,transparent_1px)] bg-size-[24px_24px]" />
            </div>
          </div>
        </div>

        {/* 2. Unified Header Overlay */}
        <div className="absolute top-4 sm:top-6 lg:top-10 left-0 w-full z-50 pointer-events-none px-3 sm:px-6 lg:px-14">
          <HeroItem run={run} animationKey={animationKey}>
            <div className="hero-item-enter flex flex-col items-center text-center max-w-2xl mx-auto gap-1.5 sm:gap-2">
              <Badge
                variant="primary"
                size="default"
                className="mt-1 sm:mt-4 px-2 py-0 h-5 sm:h-auto"
              >
                <Trophy className="h-3 w-3 shrink-0" />
                <span className="truncate text-[10px] sm:text-xs">
                  {slide.badgeText || "Performance Face-Off"}
                </span>
              </Badge>
              <h1 className="text-lg xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none drop-shadow-sm wrap-break-word">
                {slide.headline}
              </h1>
              <p className="hidden md:block text-[10px] sm:text-sm md:text-base lg:text-lg font-medium text-warm-gray-500 max-w-lg leading-relaxed line-clamp-2">
                {slide.description}
              </p>
            </div>
          </HeroItem>
        </div>

        {/* 3. The Arena - Compact & Impactful */}
        <div className="relative z-10 w-full h-full flex flex-col lg:flex-row pt-20 sm:pt-28 lg:pt-36 pb-4 sm:pb-6 lg:pb-10">
          {/* LEFT GLADIATOR */}
          <div
            className={cn(
              "relative flex-1 flex flex-col transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] px-3 sm:px-6 lg:px-14",
              hoveredSide === "left" ? "lg:flex-[1.2]" : "lg:flex-1",
              hoveredSide === "right"
                ? "opacity-20 blur-sm scale-[0.98]"
                : "opacity-100"
            )}
            onMouseEnter={() => handleSideHover("left")}
          >
            {/* Gladiator Identity */}
            <div className="mb-4">
              {isLeftLoading ? (
                <>
                  <SkeletonBlock className="h-2 w-32 mb-2" />
                  <SkeletonBlock className="h-8 lg:h-10 w-3/4 mb-3" />
                  <SkeletonBlock className="h-6 w-24" />
                </>
              ) : leftProduct ? (
                <>
                  <span className="text-[7px] sm:text-[8px] font-black text-red-600 uppercase tracking-[0.4em] block mb-0.5 sm:mb-1">
                    Origin: Challenger A
                  </span>
                  <h2 className="text-lg xs:text-xl sm:text-2xl lg:text-4xl font-black text-gray-900 tracking-tighter leading-none mb-2 sm:mb-3 wrap-break-word">
                    {leftProduct.name}
                  </h2>
                  <HeroPriceBlock
                    product={leftProduct}
                    className="scale-[0.85] sm:scale-90 origin-left"
                  />
                </>
              ) : null}
            </div>

            {/* Scaleable Visuals */}
            <div className="flex-1 relative flex items-center justify-center min-h-0 py-2 pointer-events-none group/img">
              {/* Product Shadow/Podestal */}
              <div className="absolute bottom-4 lg:bottom-8 w-3/4 h-6 bg-red-600/5 blur-3xl rounded-full scale-x-150 transition-opacity duration-700" />

              {isLeftLoading ? (
                <SkeletonBlock className="w-full h-[200px] sm:h-[250px] lg:h-[200px]" />
              ) : leftProduct ? (
                <div
                  className={cn(
                    "relative w-full h-[200px] sm:h-[250px] lg:h-[200px] transition-all duration-1000",
                    hoveredSide === "left"
                      ? "scale-115 -rotate-2 drop-shadow-[0_40px_80px_rgba(250,6,3,0.15)]"
                      : "scale-100 drop-shadow-2xl grayscale-[0.2]"
                  )}
                >
                  <Image
                    src={getProductImageWithPlaceholder(leftProduct)}
                    alt={leftProduct.name}
                    fill
                    className="object-contain"
                    sizes="50vw"
                    priority
                  />
                </div>
              ) : null}
            </div>

            {/* Matrix Data Layer */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-1.5 mt-auto">
              {isLeftLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonBlock key={i} className="h-12 sm:h-16 rounded-lg" />
                  ))
                : slide.comparisonPoints && slide.comparisonPoints.length > 0
                ? slide.comparisonPoints.slice(0, 4).map((point, i) => (
                    <div
                      key={i}
                      className={cn(
                        "p-1.5 sm:p-2 rounded-lg border transition-all duration-500 backdrop-blur-xl",
                        hoveredSide === "left"
                          ? "bg-white/80 border-red-600/30 shadow-lg"
                          : "bg-white/20 border-white/40"
                      )}
                    >
                      <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5">
                        <div className="w-1 h-1 rounded-full bg-red-600 shrink-0" />
                        <span className="text-[6px] sm:text-[7px] font-black text-gray-400 uppercase tracking-widest truncate">
                          {point.label}
                        </span>
                      </div>
                      <div className="text-[8px] sm:text-[9px] lg:text-[11px] font-bold text-gray-900 truncate">
                        {point.leftValue}
                      </div>
                    </div>
                  ))
                : null}
            </div>

            {/* CTA Button for Left Product */}
            <div className="mt-3 sm:mt-4 lg:mt-6 flex justify-center lg:justify-start">
              {isLeftLoading ? (
                <SkeletonBlock className="h-7 sm:h-12 lg:h-14 w-full sm:w-40 rounded-xl" />
              ) : (
                <Link
                  href={leftProduct ? productRoutes.detail(leftProduct.slug) : resolveSlidePrimaryCtaHref(slide as any)}
                  className="w-full sm:w-auto"
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                >
                  <Button
                    size="hero"
                    className="w-full bg-gray-900 hover:bg-black text-white rounded-xl shadow-2xl shadow-gray-900/20 transition-all hover:scale-[1.05] active:scale-[0.95] h-7 sm:h-12 lg:h-14 px-2.5 sm:px-6 lg:px-8"
                  >
                    <span className="font-black uppercase tracking-widest text-[9px] sm:text-sm md:text-base">
                      {slide.ctaPrimary?.label || "View Product"} A
                    </span>
                    <ArrowRight className="h-2.5 w-2.5 sm:h-4 sm:w-4 ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* RIGHT GLADIATOR */}
          <div
            className={cn(
              "relative flex-1 flex flex-col transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] px-3 sm:px-6 lg:px-14 lg:text-right",
              hoveredSide === "right" ? "lg:flex-[1.2]" : "lg:flex-1",
              hoveredSide === "left"
                ? "opacity-20 blur-sm scale-[0.98]"
                : "opacity-100"
            )}
            onMouseEnter={() => handleSideHover("right")}
          >
            {/* Gladiator Identity */}
            <div className="mb-4">
              {isRightLoading ? (
                <>
                  <SkeletonBlock className="h-2 w-32 mb-2 ml-auto lg:ml-0" />
                  <SkeletonBlock className="h-8 lg:h-10 w-3/4 mb-3 ml-auto lg:ml-0" />
                  <div className="flex lg:justify-end">
                    <SkeletonBlock className="h-6 w-24" />
                  </div>
                </>
              ) : rightProduct ? (
                <>
                  <span className="text-[7px] sm:text-[8px] font-black text-red-600 uppercase tracking-[0.4em] block mb-0.5 sm:mb-1">
                    Origin: Challenger B
                  </span>
                  <h2 className="text-lg xs:text-xl sm:text-2xl lg:text-4xl font-black text-gray-900 tracking-tighter leading-none mb-2 sm:mb-3 wrap-break-word">
                    {rightProduct.name}
                  </h2>
                  <div className="flex lg:justify-end">
                    <HeroPriceBlock
                      product={rightProduct}
                      className="scale-[0.85] sm:scale-90 origin-right"
                    />
                  </div>
                </>
              ) : null}
            </div>

            {/* Scaleable Visuals */}
            <div className="flex-1 relative flex items-center justify-center min-h-0 py-2 pointer-events-none">
              {/* Product Shadow/Podestal */}
              <div className="absolute bottom-4 lg:bottom-8 w-3/4 h-6 bg-red-600/5 blur-3xl rounded-full scale-x-150 transition-opacity duration-700" />

              {isRightLoading ? (
                <SkeletonBlock className="w-full h-[200px] sm:h-[250px] lg:h-[200px]" />
              ) : rightProduct ? (
                <div
                  className={cn(
                    "relative w-full h-[200px] sm:h-[250px] lg:h-[200px] transition-all duration-1000",
                    hoveredSide === "right"
                      ? "scale-115 rotate-2 drop-shadow-[0_40px_80px_rgba(250,6,3,0.15)]"
                      : "scale-100 drop-shadow-2xl grayscale-[0.2]"
                  )}
                >
                  <Image
                    src={getProductImageWithPlaceholder(rightProduct)}
                    alt={rightProduct.name}
                    fill
                    className="object-contain"
                    sizes="50vw"
                    priority
                  />
                </div>
              ) : null}
            </div>

            {/* Matrix Data Layer */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-1.5 mt-auto">
              {isRightLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonBlock key={i} className="h-12 sm:h-16 rounded-lg" />
                  ))
                : slide.comparisonPoints && slide.comparisonPoints.length > 0
                ? slide.comparisonPoints.slice(0, 4).map((point, i) => (
                    <div
                      key={i}
                      className={cn(
                        "p-1.5 sm:p-2 rounded-lg border transition-all duration-500 backdrop-blur-xl lg:text-right",
                        hoveredSide === "right"
                          ? "bg-white/80 border-red-600/30 shadow-lg"
                          : "bg-white/20 border-white/40"
                      )}
                    >
                      <div className="flex items-center lg:justify-end gap-1 sm:gap-1.5 mb-0.5">
                        <span className="text-[6px] sm:text-[7px] font-black text-gray-400 uppercase tracking-widest truncate">
                          {point.label}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-red-600 shrink-0" />
                      </div>
                      <div className="text-[8px] sm:text-[9px] lg:text-[11px] font-bold text-gray-900 truncate">
                        {point.rightValue}
                      </div>
                    </div>
                  ))
                : null}
            </div>

            {/* CTA Button for Right Product */}
            <div className="mt-3 sm:mt-4 lg:mt-6 flex justify-center lg:justify-end">
              {isRightLoading ? (
                <SkeletonBlock className="h-7 sm:h-12 lg:h-14 w-full sm:w-40 rounded-xl" />
              ) : (
                <Link
                  href={rightProduct ? productRoutes.detail(rightProduct.slug) : resolveSlidePrimaryCtaHref(slide as any)}
                  className="w-full sm:w-auto"
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                >
                  <Button
                    size="hero"
                    className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-2xl shadow-red-600/20 transition-all hover:scale-[1.05] active:scale-[0.95] h-7 sm:h-12 lg:h-14 px-2.5 sm:px-6 lg:px-8"
                  >
                    <span className="font-black uppercase tracking-widest text-[9px] sm:text-sm md:text-base">
                      {slide.ctaPrimary?.label || "View Product"} B
                    </span>
                    <ArrowRight className="h-2.5 w-2.5 sm:h-4 sm:w-4 ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default ComparisonBattleSlideBody;
