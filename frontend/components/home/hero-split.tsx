// Hero slider with unique storytelling approach and distinctive personality
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
  Star,
  Users,
  Clock,
  Gift,
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
      spacing="lg"
      className="relative overflow-hidden min-h-[90vh] flex items-center bg-gradient-to-br from-primary-50/30 via-white/50 to-purple-50/30"
    >
      {/* Subtle animated background - clean and sophisticated */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Minimal floating elements */}
        <div className="absolute top-20 left-16 w-32 h-32 bg-primary-200/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-32 right-20 w-40 h-40 bg-purple-200/8 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/3 w-24 h-24 bg-primary-300/5 rounded-full blur-2xl animate-bounce"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <Container size="xl" className="relative z-10">
        <div className="relative max-w-7xl mx-auto">
          {/* Clean, spacious slide container */}
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 min-h-[700px]">
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
                  {/* Spacious, creative layout */}
                  <div className="flex flex-col lg:flex-row items-center min-h-[700px] p-8 lg:p-12 gap-12 lg:gap-16">
                    {/* Left: Clean, focused content */}
                    <div className="flex-1 space-y-8 max-w-2xl">
                      {/* Minimal badge */}
                      <div className="inline-flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-full border border-primary-100">
                        <Sparkles className="h-4 w-4 text-primary-600 animate-pulse" />
                        <span className="text-sm text-primary-700 font-[var(--font-caveat)] font-semibold">
                          {index === 0 ? "Fresh discovery" : "Curated find"}
                        </span>
                      </div>

                      {/* Clean, impactful headline */}
                      <div className="space-y-6">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[0.95] text-warm-gray-900 font-[var(--font-playfair)] font-bold">
                          <span className="block italic">Every</span>
                          <span className="block text-primary-600">
                            piece tells
                          </span>
                          <span className="block">a story</span>
                        </h1>

                        <p className="text-xl text-warm-gray-700 max-w-lg leading-relaxed font-[var(--font-inter)]">
                          We hunt for the kind of treasures that make you pause,
                          smile, and want to know more. Each one chosen with
                          care, each one with character.
                        </p>
                      </div>

                      {/* Simple, focused CTA */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Link href="/products">
                          <Button
                            size="lg"
                            className="rounded-full px-8 py-4 text-lg font-[var(--font-inter)] font-medium bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            Explore Collection
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </Link>
                      </div>

                      {/* Minimal social proof */}
                      <div className="flex items-center gap-8 pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-600 font-[var(--font-poppins)]">
                            12K+
                          </div>
                          <div className="text-sm text-warm-gray-600 font-[var(--font-inter)]">
                            Happy customers
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-600 font-[var(--font-poppins)]">
                            5★
                          </div>
                          <div className="text-sm text-warm-gray-600 font-[var(--font-inter)]">
                            Average rating
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-600 font-[var(--font-poppins)]">
                            2019
                          </div>
                          <div className="text-sm text-warm-gray-600 font-[var(--font-inter)]">
                            Founded
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Creative Product Showcase */}
                    <div className="flex-1 max-w-lg relative">
                      <div className="group relative">
                        {/* Floating Product Cards - Unique layered approach */}
                        <div className="relative h-96 lg:h-[500px]">
                          {/* Background decorative card */}
                          <div className="absolute top-8 left-8 w-full h-full bg-gradient-to-br from-primary-100 to-purple-100 rounded-3xl transform rotate-3 shadow-lg opacity-60 group-hover:rotate-6 transition-transform duration-500"></div>

                          {/* Main product card */}
                          <div className="absolute top-4 left-4 w-full h-full">
                            <Link
                              href={`/products/${product.slug}`}
                              className="block w-full h-full group/card relative"
                            >
                              {/* Product image container - fixed rendering */}
                              <div className="w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-warm-gray-100 hover:shadow-3xl transition-all duration-500">
                                <Image
                                  src={getProductImageWithPlaceholder(product)}
                                  alt={product.name}
                                  fill
                                  className="object-cover transition-transform duration-700 group-hover/card:scale-105"
                                  sizes="(max-width: 1024px) 100vw, 40vw"
                                  priority={isActive}
                                  quality={90}
                                />

                                {/* Subtle overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>

                                {/* Minimal info overlay */}
                                <div className="absolute bottom-6 left-6 right-6">
                                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 transform translate-y-2 group-hover/card:translate-y-0 transition-transform duration-500">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm text-primary-600 font-semibold uppercase tracking-wide mb-1">
                                          {product.category?.name ||
                                            "Collection"}
                                        </p>
                                        <h3 className="text-lg font-bold text-warm-gray-900 font-[var(--font-playfair)] leading-tight">
                                          {product.name}
                                        </h3>
                                      </div>
                                      <div className="text-right">
                                        <Price
                                          amount={product.price}
                                          size="lg"
                                          className="text-primary-600 font-bold"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </div>

                          {/* Floating accent elements */}
                          <div className="absolute -top-2 -right-2 w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                            <Sparkles className="h-6 w-6 text-white" />
                          </div>

                          <div
                            className="absolute -bottom-4 -left-4 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg animate-bounce"
                            style={{ animationDelay: "1s" }}
                          >
                            <Heart className="h-5 w-5 text-white fill-white" />
                          </div>
                        </div>

                        {/* Product story below */}
                        <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-lg">
                                S
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-primary-700">
                                  Sarah, Lead Curator
                                </span>
                                <div className="w-1 h-1 bg-primary-400 rounded-full"></div>
                                <span className="text-xs text-warm-gray-500">
                                  2 days ago
                                </span>
                              </div>
                              <p className="text-warm-gray-700 leading-relaxed italic">
                                &ldquo;This piece stopped me in my tracks.
                                There's something about its craftsmanship that
                                speaks to the soul. The kind of find that
                                becomes part of your story.&rdquo;
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clean Navigation Controls */}
          {validProducts.length > 1 && (
            <>
              {/* Minimal arrow navigation */}
              <button
                onClick={prevSlide}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm border border-white/50 hover:bg-white hover:border-primary-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5 text-primary-600 group-hover:text-primary-700 transition-colors" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm border border-white/50 hover:bg-white hover:border-primary-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5 text-primary-600 group-hover:text-primary-700 transition-colors" />
              </button>

              {/* Clean slide indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                <div className="flex items-center gap-2">
                  {validProducts.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? "bg-primary-500 w-8"
                          : "bg-white/50 hover:bg-white/70"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Minimal play/pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute top-6 right-6 z-30 w-10 h-10 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 hover:bg-white/80 hover:border-primary-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center group"
                aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 text-primary-600 group-hover:text-primary-700 transition-colors" />
                ) : (
                  <Play className="h-4 w-4 text-primary-600 group-hover:text-primary-700 transition-colors" />
                )}
              </button>
            </>
          )}
        </div>
      </Container>
    </Section>
  );
}
