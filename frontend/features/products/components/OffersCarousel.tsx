// Carousel showcasing promotional offers.
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/features/products/types";
import { formatPrice } from "@/lib/utils";

type OfferProduct = Product & {
  originalPrice: number;
  discountPercent: number;
  bundledItems?: string[];
};

interface OffersCarouselProps {
  products: OfferProduct[];
  className?: string;
}

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23f3f4f6' width='800' height='600'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

// Helper function to extract brand name from product name
const getBrandName = (productName: string): string => {
  const brands = [
    "Xiaomi",
    "Apple",
    "Samsung",
    "Honor",
    "Tecno",
    "Infinix",
    "Redmi",
  ];
  for (const brand of brands) {
    if (productName.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  return "Special";
};

// Generate bundled items based on product data
const getBundledItems = (product: OfferProduct): string[] => {
  // If bundled items are provided, use them
  if (product.bundledItems && product.bundledItems.length > 0) {
    return product.bundledItems;
  }

  // Generate based on product category or type
  const categoryName = product.category?.name?.toLowerCase() || "";
  const productName = product.name.toLowerCase();

  const defaultItems: string[] = [];

  // Electronics/Phones get tech accessories
  if (
    categoryName.includes("electronic") ||
    productName.includes("phone") ||
    productName.includes("iphone")
  ) {
    defaultItems.push(
      "Free Powerbank 10,000mAh",
      "Free Wireless Earbuds",
      "Free Phone Stand",
      "Free Screen Protector",
      "Free Smartwatch",
      "Free Carrying Bag"
    );
  } else if (
    productName.includes("laptop") ||
    productName.includes("computer")
  ) {
    defaultItems.push(
      "Free Wireless Mouse",
      "Free Laptop Bag",
      "Free USB Hub",
      "Free Keyboard Cleaner"
    );
  } else if (
    productName.includes("headphone") ||
    productName.includes("earbud")
  ) {
    defaultItems.push(
      "Free Carrying Case",
      "Free Audio Cable",
      "Free Cleaning Kit"
    );
  } else {
    // Generic gifts
    defaultItems.push(
      "Free Gift Box",
      "Free Warranty Extension",
      "Free Installation Guide"
    );
  }

  return defaultItems.slice(0, 6); // Limit to 6 items
};

export function OffersCarousel({
  products,
  className = "",
}: OffersCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const isUserInteractingRef = useRef(false);

  // Smooth transition to next slide
  const goToSlide = useCallback(
    (index: number) => {
      if (index === currentIndex || isTransitioning) return;
      if (index < 0 || index >= products.length) return;

      setIsTransitioning(true);
      setCurrentIndex(index);

      // Reset transition state after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500); // Match CSS transition duration
    },
    [currentIndex, isTransitioning, products.length]
  );

  const goToPrevious = useCallback(() => {
    if (isTransitioning) return;
    isUserInteractingRef.current = true;
    const newIndex = (currentIndex - 1 + products.length) % products.length;
    goToSlide(newIndex);
    // Reset user interaction flag after a delay
    setTimeout(() => {
      isUserInteractingRef.current = false;
    }, 3000);
  }, [currentIndex, products.length, isTransitioning, goToSlide]);

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    isUserInteractingRef.current = true;
    const newIndex = (currentIndex + 1) % products.length;
    goToSlide(newIndex);
    // Reset user interaction flag after a delay
    setTimeout(() => {
      isUserInteractingRef.current = false;
    }, 3000);
  }, [currentIndex, products.length, isTransitioning, goToSlide]);

  // Auto-play functionality
  useEffect(() => {
    if (products.length <= 1) return;

    const startAutoPlay = () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }

      autoPlayRef.current = setInterval(() => {
        // Only auto-play if user is not interacting
        if (!isUserInteractingRef.current && !isTransitioning) {
          setCurrentIndex((prev) => {
            const next = (prev + 1) % products.length;
            setIsTransitioning(true);
            setTimeout(() => setIsTransitioning(false), 500);
            return next;
          });
        }
      }, 5000); // Change slide every 5 seconds
    };

    startAutoPlay();

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [products.length, isTransitioning]);

  if (products.length === 0) return null;

  return (
    <section className={`relative w-full overflow-hidden ${className}`}>
      {/* Full-width promotional banner */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 h-[500px] md:h-[600px] lg:h-[650px]">
        {/* Left side - Light beige background with product info */}
        <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center overflow-hidden">
          {/* Snowflake pattern overlay */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>

          {/* Content container with smooth sliding */}
          <div className="relative w-full h-full overflow-hidden">
            <div
              className="flex h-full transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {products.map((product) => {
                const brandName = getBrandName(product.name);

                return (
                  <div
                    key={product.id}
                    className="min-w-full flex items-center px-6 py-12 md:px-10 md:py-16 lg:px-16 lg:py-20"
                  >
                    <div className="w-full">
                      {/* Xmas Gifts label */}
                      <span className="mb-3 inline-block text-red-600 text-sm font-bold uppercase tracking-wider">
                        Xmas Gifts
                      </span>

                      {/* Brand name with decorative element */}
                      <div className="mb-2 flex items-center gap-2">
                        <h2
                          className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900"
                          style={{
                            fontFamily: "var(--font-righteous), sans-serif",
                          }}
                        >
                          {brandName}
                        </h2>
                        <span className="text-3xl md:text-4xl animate-bounce-slow">
                          🎅
                        </span>
                      </div>

                      {/* Offer title */}
                      <h3
                        className="mb-4 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900"
                        style={{
                          fontFamily: "var(--font-righteous), sans-serif",
                        }}
                      >
                        Christmas Offer!
                      </h3>

                      {/* Product name */}
                      <p className="mb-6 text-base md:text-lg text-gray-700 font-medium">
                        {product.name}
                      </p>

                      {/* Price with discount */}
                      <div className="mb-8">
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <span
                            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900"
                            style={{
                              fontFamily: "var(--font-righteous), sans-serif",
                            }}
                          >
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice > product.price && (
                            <>
                              <span className="text-xl md:text-2xl text-gray-400 line-through">
                                {formatPrice(product.originalPrice)}
                              </span>
                              <span className="text-lg md:text-xl font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full animate-pulse-slow">
                                Save {product.discountPercent}%
                              </span>
                            </>
                          )}
                        </div>
                        {product.stock > 0 && (
                          <p className="mt-2 text-sm text-gray-600">
                            ✓ {product.stock} in stock
                          </p>
                        )}
                      </div>

                      {/* CTA Button */}
                      <Link href={`/products/${product.slug}`}>
                        <Button
                          size="lg"
                          className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 text-base md:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                        >
                          Catch The Offer
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Left navigation arrow */}
          {products.length > 1 && (
            <button
              onClick={goToPrevious}
              className="absolute left-2 md:left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 md:p-3 shadow-lg transition-all hover:bg-white hover:scale-110 active:scale-95"
              aria-label="Previous offer"
              disabled={isTransitioning}
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-gray-900" />
            </button>
          )}
        </div>

        {/* Right side - Red circular background with product image */}
        <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center overflow-hidden">
          {/* Large circular shape */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full bg-red-600 rounded-full -mr-[50%] md:-mr-[30%] lg:-mr-[20%] flex items-center justify-center relative">
              {/* Product images container with smooth sliding */}
              <div className="relative w-full h-full max-w-[600px] max-h-[600px] z-10 flex items-center justify-center overflow-hidden">
                <div
                  className="flex h-full w-full transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${currentIndex * 100}%)`,
                  }}
                >
                  {products.map((product, index) => {
                    const imageUrl =
                      product.variants?.[0]?.image ??
                      product.variants?.[0]?.images?.[0] ??
                      null;
                    const displayImage =
                      imageErrors[`${index}-main`] || !imageUrl
                        ? PLACEHOLDER_IMAGE
                        : imageUrl;

                    // Get all product images from all variants
                    const productImages: string[] = [];
                    if (product.variants) {
                      for (const variant of product.variants) {
                        if (variant.image) productImages.push(variant.image);
                        if (variant.images && variant.images.length > 0) {
                          productImages.push(...variant.images);
                        }
                      }
                    }
                    const uniqueImages = Array.from(new Set(productImages))
                      .filter((img): img is string => Boolean(img))
                      .slice(0, 3);

                    return (
                      <div
                        key={product.id}
                        className="min-w-full h-full flex items-center justify-center p-8 md:p-12 lg:p-16"
                      >
                        {uniqueImages.length > 1 ? (
                          // Show multiple product images/variants
                          <div className="relative w-full h-full flex items-center justify-center gap-4">
                            {uniqueImages.map((img, idx) => {
                              if (!img) return null;
                              return (
                                <div
                                  key={`${product.id}-${idx}`}
                                  className={`relative flex-1 h-full transition-all duration-500 ${
                                    idx === 0
                                      ? "z-10 scale-110 animate-float"
                                      : "z-0 scale-90 opacity-80"
                                  }`}
                                >
                                  <Image
                                    src={img}
                                    alt={`${product.name} ${idx + 1}`}
                                    fill
                                    className="object-contain transition-transform duration-500 hover:scale-110"
                                    priority={index === 0 && idx === 0}
                                    onError={() =>
                                      setImageErrors((prev) => ({
                                        ...prev,
                                        [`${index}-${idx}`]: true,
                                      }))
                                    }
                                    unoptimized={img.startsWith("data:")}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          // Single product image
                          <div className="relative w-full h-full">
                            <Image
                              src={displayImage}
                              alt={product.name}
                              fill
                              className="object-contain transition-transform duration-500 hover:scale-105"
                              priority={index === 0}
                              onError={() =>
                                setImageErrors((prev) => ({
                                  ...prev,
                                  [`${index}-main`]: true,
                                }))
                              }
                              unoptimized={displayImage.startsWith("data:")}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bundled items list - Dynamic */}
              {products.map((product, index) => {
                const bundledItems = getBundledItems(product);
                if (bundledItems.length === 0) return null;

                return (
                  <div
                    key={`bundled-${product.id}`}
                    className={`absolute bottom-16 md:bottom-20 left-4 md:left-8 z-20 text-white max-w-[200px] md:max-w-[250px] transition-opacity duration-300 ${
                      index === currentIndex ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <ul className="text-xs md:text-sm font-medium space-y-1">
                      {bundledItems.slice(0, 6).map((item, idx) => (
                        <li
                          key={`${product.id}-${idx}`}
                          className="flex items-start gap-1"
                        >
                          <span>•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decorative Christmas tree (emoji) - positioned on right edge */}
          {products.map((product, index) => (
            <div
              key={`tree-${product.id}`}
              className={`absolute bottom-4 right-4 md:bottom-8 md:right-8 z-30 text-4xl md:text-6xl transition-opacity duration-300 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              } animate-swing pointer-events-none`}
            >
              🎄
            </div>
          ))}

          {/* Right navigation arrow */}
          {products.length > 1 && (
            <button
              onClick={goToNext}
              className="absolute right-2 md:right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 md:p-3 shadow-lg transition-all hover:bg-white hover:scale-110 active:scale-95"
              aria-label="Next offer"
              disabled={isTransitioning}
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-gray-900" />
            </button>
          )}
        </div>
      </div>

      {/* Pagination Dots */}
      {products.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                isUserInteractingRef.current = true;
                goToSlide(index);
                setTimeout(() => {
                  isUserInteractingRef.current = false;
                }, 3000);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-white shadow-md"
                  : "w-2 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to offer ${index + 1}`}
              disabled={isTransitioning}
            />
          ))}
        </div>
      )}
    </section>
  );
}
