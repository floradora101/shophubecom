// Carousel showcasing promotional offers.
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types/product.types";

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
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");

  useEffect(() => {
    if (products.length <= 1) return;
    const interval = setInterval(() => {
      setDirection("right");
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, [products.length]);

  if (products.length === 0) return null;

  const currentProduct = products[currentIndex];
  // Get image from variants
  const imageUrl =
    currentProduct.variants?.[0]?.image ??
    currentProduct.variants?.[0]?.images?.[0] ??
    null;
  const displayImage =
    imageErrors[currentIndex] || !imageUrl ? PLACEHOLDER_IMAGE : imageUrl;
  const brandName = getBrandName(currentProduct.name);
  const bundledItems = getBundledItems(currentProduct);

  // Get all product images from all variants
  const productImages: string[] = [];
  if (currentProduct.variants) {
    for (const variant of currentProduct.variants) {
      if (variant.image) productImages.push(variant.image);
      if (variant.images && variant.images.length > 0) {
        productImages.push(...variant.images);
      }
    }
  }
  const uniqueImages = Array.from(new Set(productImages))
    .filter((img): img is string => Boolean(img))
    .slice(0, 3); // Show up to 3 product images/variants

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? "right" : "left");
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  const goToPrevious = () => {
    setDirection("left");
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
      setIsTransitioning(false);
    }, 300);
  };

  const goToNext = () => {
    setDirection("right");
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
      setIsTransitioning(false);
    }, 300);
  };

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

          <div className="relative w-full px-6 py-12 md:px-10 md:py-16 lg:px-16 lg:py-20 z-10 overflow-hidden">
            <div
              key={`content-${currentIndex}`}
              className={`transition-all duration-500 ease-in-out ${
                isTransitioning
                  ? direction === "right"
                    ? "opacity-0 translate-x-[-20px]"
                    : "opacity-0 translate-x-[20px]"
                  : "opacity-100 translate-x-0"
              }`}
            >
              {/* Xmas Gifts label */}
              <span className="mb-3 inline-block text-red-600 text-sm font-bold uppercase tracking-wider animate-fade-in">
                Xmas Gifts
              </span>

              {/* Brand name with decorative element */}
              <div className="mb-2 flex items-center gap-2">
                <h2
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 animate-slide-in-left"
                  style={{ animationDelay: "0.1s" }}
                >
                  {brandName}
                </h2>
                {/* Decorative icon (Santa hat) */}
                <span className="text-3xl md:text-4xl animate-bounce-slow">
                  🎅
                </span>
              </div>

              {/* Offer title */}
              <h3
                className="mb-4 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 animate-slide-in-left"
                style={{ animationDelay: "0.2s" }}
              >
                Christmas Offer!
              </h3>

              {/* Product name */}
              <p
                className="mb-6 text-base md:text-lg text-gray-700 font-medium animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                {currentProduct.name}
              </p>

              {/* Price with discount */}
              <div
                className="mb-8 animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
                    ${currentProduct.price.toFixed(0)}
                  </span>
                  {currentProduct.originalPrice > currentProduct.price && (
                    <>
                      <span className="text-xl md:text-2xl text-gray-400 line-through">
                        ${currentProduct.originalPrice.toFixed(0)}
                      </span>
                      <span className="text-lg md:text-xl font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full animate-pulse-slow">
                        Save {currentProduct.discountPercent}%
                      </span>
                    </>
                  )}
                </div>
                {currentProduct.stock > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    ✓ {currentProduct.stock} in stock
                  </p>
                )}
              </div>

              {/* CTA Button */}
              <div
                style={{ animationDelay: "0.5s" }}
                className="animate-fade-in"
              >
                <Link href={`/products/${currentProduct.slug}`}>
                  <Button
                    size="lg"
                    className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 text-base md:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    Catch The Offer
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Left navigation arrow */}
          {products.length > 1 && (
            <button
              onClick={goToPrevious}
              className="absolute left-2 md:left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 md:p-3 shadow-lg transition-all hover:bg-white hover:scale-110"
              aria-label="Previous offer"
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
              {/* Product images - Show multiple variants if available */}
              <div className="relative w-full h-full max-w-[600px] max-h-[600px] z-10 flex items-center justify-center overflow-hidden">
                {productImages.length > 1 ? (
                  // Show multiple product images/variants
                  <div
                    key={`images-${currentIndex}`}
                    className={`relative w-full h-full flex items-center justify-center gap-4 p-8 md:p-12 lg:p-16 transition-all duration-700 ease-in-out ${
                      isTransitioning
                        ? direction === "right"
                          ? "opacity-0 scale-95 translate-x-[50px]"
                          : "opacity-0 scale-95 translate-x-[-50px]"
                        : "opacity-100 scale-100 translate-x-0"
                    }`}
                  >
                    {productImages.slice(0, 3).map((img, idx) => {
                      if (!img) return null;
                      return (
                        <div
                          key={`${currentIndex}-${idx}`}
                          className={`relative flex-1 h-full transition-all duration-500 ${
                            idx === 0
                              ? "z-10 scale-110 animate-float"
                              : "z-0 scale-90 opacity-80"
                          }`}
                          style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                          <Image
                            src={img}
                            alt={`${currentProduct.name} ${idx + 1}`}
                            fill
                            className="object-contain transition-transform duration-500 hover:scale-110"
                            priority={currentIndex === 0 && idx === 0}
                            onError={() =>
                              setImageErrors((prev) => ({
                                ...prev,
                                [`${currentIndex}-${idx}`]: true,
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
                  <div
                    key={`image-${currentIndex}`}
                    className={`relative w-full h-full transition-all duration-700 ease-in-out ${
                      isTransitioning
                        ? direction === "right"
                          ? "opacity-0 scale-95 translate-x-[50px] rotate-[-5deg]"
                          : "opacity-0 scale-95 translate-x-[-50px] rotate-[5deg]"
                        : "opacity-100 scale-100 translate-x-0 rotate-0"
                    }`}
                  >
                    <Image
                      src={displayImage}
                      alt={currentProduct.name}
                      fill
                      className="object-contain p-8 md:p-12 lg:p-16 transition-transform duration-500 hover:scale-105"
                      priority={currentIndex === 0}
                      onError={() =>
                        setImageErrors((prev) => ({
                          ...prev,
                          [currentIndex]: true,
                        }))
                      }
                      unoptimized={displayImage.startsWith("data:")}
                    />
                  </div>
                )}
              </div>

              {/* Bundled items list - Dynamic */}
              {bundledItems.length > 0 && (
                <div
                  key={`bundled-${currentIndex}`}
                  className={`absolute bottom-16 md:bottom-20 left-4 md:left-8 z-20 text-white max-w-[200px] md:max-w-[250px] transition-all duration-500 ${
                    isTransitioning
                      ? "opacity-0 translate-x-[-20px]"
                      : "opacity-100 translate-x-0"
                  }`}
                  style={{ transitionDelay: "0.3s" }}
                >
                  <ul className="text-xs md:text-sm font-medium space-y-1">
                    {bundledItems.slice(0, 6).map((item, idx) => (
                      <li
                        key={`${currentIndex}-${idx}`}
                        className="flex items-start gap-1 animate-fade-in-up"
                        style={{ animationDelay: `${idx * 0.1}s` }}
                      >
                        <span>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Decorative Christmas tree (emoji) */}
              <div
                key={`tree-${currentIndex}`}
                className={`absolute bottom-4 right-4 md:bottom-8 md:right-8 z-20 text-4xl md:text-6xl transition-all duration-500 ${
                  isTransitioning
                    ? "opacity-0 scale-75 rotate-[-15deg]"
                    : "opacity-100 scale-100 rotate-0"
                } animate-swing`}
                style={{ transitionDelay: "0.4s" }}
              >
                🎄
              </div>
            </div>
          </div>

          {/* Right navigation arrow */}
          {products.length > 1 && (
            <button
              onClick={goToNext}
              className="absolute right-2 md:right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 md:p-3 shadow-lg transition-all hover:bg-white hover:scale-110"
              aria-label="Next offer"
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
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-white shadow-md"
                  : "w-2 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to offer ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
