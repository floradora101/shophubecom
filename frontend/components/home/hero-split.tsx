// Hero slider with smooth sliding animations and synchronized sections
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Heart,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { SlideIndicators } from "./shared/slide-indicators";
import { getProductImageWithPlaceholder } from "@/lib/utils";
import { ensureArray } from "@/lib/utils";
import type { Product } from "@/features/products/types";

interface HeroSplitProps {
  featuredProduct: Product;
  featuredProducts?: Product[];
}

export function HeroSplit({
  featuredProduct,
  featuredProducts = [],
}: HeroSplitProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get all products for slider
  const allProducts =
    ensureArray(featuredProducts).length > 0
      ? ensureArray(featuredProducts)
      : [featuredProduct];

  // Filter out any invalid products
  const validProducts = allProducts.filter((p) => p && p.id);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && validProducts.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % validProducts.length);
      }, 5000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, validProducts.length]);

  // Early return if no products (after hooks)
  if (!validProducts || validProducts.length === 0) {
    return null;
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 3000);
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % validProducts.length);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + validProducts.length) % validProducts.length);
  };

  return (
    <Section
      spacing="md"
      className="relative overflow-hidden min-h-[85vh] flex items-center"
    >
      {/* Subtle animated background elements - blended with page background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-10 w-72 h-72 bg-cream-200/20 rounded-full blur-3xl transition-all duration-1000"
          style={{
            transform: `translate(${Math.sin(currentSlide * 0.5) * 50}px, ${
              Math.cos(currentSlide * 0.5) * 30
            }px)`,
          }}
        />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-warm-gray-200/15 rounded-full blur-3xl transition-all duration-1000"
          style={{
            transform: `translate(${Math.sin(currentSlide * 0.7) * -40}px, ${
              Math.cos(currentSlide * 0.7) * -50
            }px)`,
          }}
        />
      </div>

      <Container size="xl" className="relative z-10">
        <div className="relative">
          {/* Slide Container - Both sections slide together */}
          <div className="relative overflow-hidden rounded-3xl bg-white/30 backdrop-blur-sm border border-white/30 shadow-lg w-full min-h-[600px]">
            {/* Slides */}
            {validProducts.map((product, index) => {
              const isActive = index === currentSlide;
              const offset = index - currentSlide;

              return (
                <div
                  key={`slide-${product.id}-${index}`}
                  className={`w-full transition-all duration-700 ease-in-out ${
                    isActive ? "relative" : "absolute top-0 left-0"
                  } ${
                    isActive
                      ? "translate-x-0 opacity-100 z-10"
                      : offset > 0
                      ? "translate-x-full opacity-0 z-0 pointer-events-none"
                      : "-translate-x-full opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-center min-h-[600px] p-6 lg:p-8 w-full">
                    {/* Left: Content */}
                    <div className="lg:col-span-7 space-y-8">
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-primary-500 animate-pulse" />
                        <span
                          className="text-lg text-warm-gray-700 font-[var(--font-caveat)]"
                          style={{
                            fontSize: "1.5rem",
                            transform: "rotate(-2deg)",
                          }}
                        >
                          {index === 0
                            ? "handpicked just for you"
                            : `featured product ${index + 1}`}
                        </span>
                      </div>

                      <div className="space-y-6">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] text-warm-gray-900">
                          <span className="font-[var(--font-playfair)] font-bold italic">
                            Welcome home,
                          </span>
                          <br />
                          <span className="font-[var(--font-poppins)] font-bold text-primary-600">
                            where every find tells your story
                          </span>
                        </h1>
                        <p className="text-lg text-warm-gray-700 max-w-xl font-[var(--font-inter)] font-light leading-relaxed">
                          Curated collections that feel like they were made just
                          for you. Quality pieces, honest prices, and a shopping
                          experience that actually feels good.
                        </p>
                      </div>

                      {/* CTA Buttons */}
                      <div className="flex flex-wrap gap-4 pt-2">
                        <Link href="/products">
                          <Button
                            size="lg"
                            className="rounded-2xl px-8 py-6 text-base font-[var(--font-inter)] font-medium shadow-lg hover:shadow-xl transition-all"
                          >
                            Start Shopping
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </Link>
                      </div>

                      {/* Trust indicators */}
                      <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-warm-gray-600">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-primary-500 fill-primary-500" />
                          <span className="font-[var(--font-inter)]">
                            Loved by thousands
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-warm-gray-400"></div>
                          <span className="font-[var(--font-inter)]">
                            Free shipping over $50
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-warm-gray-400"></div>
                          <span className="font-[var(--font-inter)]">
                            Easy returns
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Featured Product Card - Sorbé Style */}
                    <div className="lg:col-span-5">
                      <div className="group flex flex-col">
                        {/* Image Card Section */}
                        <Link
                          href={`/products/${product.slug}`}
                          className="relative aspect-square rounded-2xl overflow-hidden transition-all duration-300 border border-warm-gray-200 hover:border-warm-gray-300 hover:shadow-lg bg-white"
                        >
                          {/* Full Image Background */}
                          <div className="absolute inset-0">
                            <Image
                              src={getProductImageWithPlaceholder(product)}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 1024px) 100vw, 50vw"
                              priority={isActive}
                              unoptimized={
                                !product.defaultVariant?.image &&
                                !product.defaultVariant?.images?.[0]
                              }
                            />
                          </div>

                          {/* Featured Badge */}
                          <div className="absolute top-3 left-3 z-20">
                            <div
                              className="bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg"
                              style={{ transform: "rotate(-3deg)" }}
                            >
                              ✨ Featured Pick
                            </div>
                          </div>

                          {/* Hover Overlay with View Product */}
                          <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 z-30 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100">
                            <Button
                              variant="secondary"
                              className="inline-flex items-center gap-2 bg-white text-warm-gray-900 px-6 py-3 rounded-full text-sm font-semibold hover:bg-warm-gray-900 hover:text-white transition-all duration-300 shadow-xl transform translate-y-4 group-hover:translate-y-0"
                            >
                              View Product
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </Link>

                        {/* Product Info Below Image */}
                        <div className="mt-3 space-y-1">
                          <Link
                            href={`/products/${product.slug}`}
                            className="block"
                          >
                            <p className="text-xs text-warm-gray-500 uppercase tracking-wider font-[var(--font-inter)] font-medium mb-1">
                              {product.category?.name || "Featured"}
                            </p>
                            <h3 className="text-lg md:text-xl font-[var(--font-playfair)] font-semibold text-warm-gray-900 hover:text-primary-600 transition-colors leading-tight line-clamp-2">
                              {product.name}
                            </h3>
                          </Link>
                          <div className="flex items-baseline gap-2">
                            <Price amount={product.price} size="lg" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          {validProducts.length > 1 && (
            <>
              {/* Arrow Navigation */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full border-2 border-primary-300 bg-white hover:bg-primary-50 hover:border-primary-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5 text-primary-600" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full border-2 border-primary-300 bg-white hover:bg-primary-50 hover:border-primary-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5 text-primary-600" />
              </button>

              {/* Simple Minimalist Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
                <SlideIndicators
                  count={validProducts.length}
                  activeIndex={currentSlide}
                  onSelect={goToSlide}
                />
              </div>

              {/* Play/Pause Button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute top-6 right-6 z-30 p-3 rounded-full border-2 border-primary-300 bg-white hover:bg-primary-50 hover:border-primary-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110"
                aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 text-primary-600" />
                ) : (
                  <Play className="h-5 w-5 text-primary-600" />
                )}
              </button>
            </>
          )}
        </div>
      </Container>
    </Section>
  );
}
