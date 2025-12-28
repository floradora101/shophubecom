// Product card used across listings - Sorbé style: full image card with title/price below
"use client";

import React, { MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, Sparkles, Clock } from "lucide-react";
import type { Product } from "../types";
import {
  getEffectiveStock,
  LOW_STOCK_THRESHOLD,
} from "@/features/products/utils/inventory";
import { useCart } from "@/features/cart/hooks";
import { formatPrice, formatPriceRange } from "@/lib/utils";
import { getGradientClass } from "@/lib/utils/gradients";
import { getProductImageWithPlaceholder } from "@/lib/utils/products";
import { getAllProductImages } from "@/features/products/utils/product-images";
import { StarRating } from "@/components/ui/star-rating";

interface ProductCardProps {
  product: Product & {
    originalPrice?: number;
    discountPercent?: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, toggleCart } = useCart();
  const router = useRouter();
  const [imageError, setImageError] = React.useState(false);

  // Get all available images for hover effects
  const allImages = getAllProductImages(product);
  const primaryImage = getProductImageWithPlaceholder(product);
  const hoverImage = allImages.length > 1 ? allImages[1] : primaryImage;
  const displayImage = imageError
    ? getProductImageWithPlaceholder(product)
    : primaryImage;
  const showHoverImage =
    hoverImage && hoverImage !== primaryImage && !imageError;

  const effectiveStock = getEffectiveStock(product);
  const isOutOfStock = effectiveStock === 0;

  // Compute variant count and selection requirement
  const variantCount = product.variants?.length ?? 0;
  const requiresSelection = variantCount !== 1; // multi-variant or invalid 0

  // Calculate discount info
  const discountPercent =
    product.discount?.discountPercent || product.discountValue || 0;
  const originalPrice =
    product.discount?.originalPrice || product.originalPrice;
  const hasDiscount =
    !!originalPrice &&
    originalPrice > product.price &&
    (product.discount?.isOnSale ?? product.isOnSale ?? discountPercent > 0);

  const handlePrimaryAction = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (requiresSelection) {
      // Multiple variants or no variants - navigate to product detail page
      router.push(`/products/${product.slug}`);
    } else {
      // Exactly 1 variant - quick add with that variant
      const variant = product.variants![0];
      if (!variant?.id) return; // Guard: variant must have id
      addItem(product, {
        variantId: variant.id,
        variantSku: variant.sku ?? null,
        // @ts-expect-error - selectedOptions type mismatch due to conditional type in AddItemOptions
        selectedOptions: variant.options,
      });
      toggleCart(true);
    }
  };

  return (
    <div className="group flex flex-col w-full">
      {/* Image Card Section */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square rounded-lg overflow-hidden transition-all duration-500 ease-out border border-warm-gray-200 hover:border-primary-300 hover:shadow-2xl hover:shadow-primary-500/10 bg-white hover:scale-[1.02] group/card"
      >
        {/* Full Image Background */}
        <div className="absolute inset-0">
          {/* Primary Image */}
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-700 ease-out ${
              showHoverImage
                ? "opacity-100 group-hover/card:opacity-0 group-hover/card:scale-105"
                : "opacity-100 group-hover/card:scale-105"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImageError(true)}
            unoptimized={displayImage.startsWith("data:")}
          />
          {/* Hover Image */}
          {showHoverImage && (
            <Image
              src={hoverImage!}
              alt={product.name}
              fill
              className="object-cover transition-all duration-700 ease-out delay-100 absolute inset-0 opacity-0 group-hover/card:opacity-100 group-hover/card:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized={hoverImage.startsWith("data:")}
            />
          )}
        </div>

        {/* Discount Badge */}
        {hasDiscount && discountPercent > 0 && (
          <div className="absolute top-3 left-3 z-sticky animate-in fade-in-0 slide-in-from-left-2 duration-500">
            <div
              className={`font-bold text-xs md:text-sm px-2.5 md:px-3 py-1 md:py-1.5 shadow-xl shadow-red-500/20 text-white rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-red-500/30 group/badge ${getGradientClass(
                "discount"
              )}`}
            >
              <Sparkles className="h-3 w-3 inline-block mr-1 transition-transform duration-300 group-hover/badge:rotate-12 group-hover/badge:scale-110 animate-pulse" />
              <span>-{discountPercent}% OFF</span>
            </div>
          </div>
        )}

        {/* Limited time badge */}
        {hasDiscount && discountPercent > 0 && (
          <div className="absolute top-3 right-3 z-sticky animate-in fade-in-0 slide-in-from-right-2 duration-500 delay-100">
            <div className="bg-white/95 backdrop-blur-sm text-xs font-semibold border border-primary-300 text-primary-700 px-2 py-1 rounded-lg transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-lg group/limited">
              <Clock className="h-3 w-3 inline-block mr-1 transition-transform duration-300 group-hover/limited:rotate-12" />
              Limited
            </div>
          </div>
        )}

        {/* Low Stock Badge - only show if no discount badges */}
        {effectiveStock > 0 &&
          effectiveStock < LOW_STOCK_THRESHOLD &&
          !hasDiscount && (
            <div className="absolute top-3 right-3 z-sticky animate-in fade-in-0 slide-in-from-right-2 duration-500">
              <div className="rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 px-2.5 py-1 text-xs font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/30 group/lowstock">
                <span className="relative">
                  Low Stock
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-75"></span>
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
                </span>
              </div>
            </div>
          )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30">
            <span className="bg-warm-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold">
              Out of Stock
            </span>
          </div>
        )}

        {/* Hover Overlay with Add to Cart */}
        {!isOutOfStock && (
          <div
            className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out z-modal bg-gradient-to-t from-black/60 via-black/40 to-transparent opacity-0 group-hover/card:opacity-100"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <button
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 md:px-7 md:py-3.5 rounded-xl text-xs md:text-sm font-semibold hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 transition-all duration-300 shadow-2xl shadow-red-500/30 hover:shadow-red-500/50 transform translate-y-6 group-hover/card:translate-y-0 group-hover/card:scale-105 hover:scale-110 active:scale-95"
              aria-label={
                requiresSelection
                  ? `Select options for ${product.name}`
                  : `Add ${product.name} to cart`
              }
              onClick={handlePrimaryAction}
            >
              <ShoppingCart className="h-3.5 w-3.5 md:h-4 md:w-4 transition-transform duration-200 group-hover/card:rotate-12" />
              <span className="whitespace-nowrap">
                {requiresSelection ? "Select Option" : "Add to Cart"}
              </span>
            </button>
          </div>
        )}
      </Link>

      {/* Product Info Below Image */}
      <div className="mt-3 space-y-1 min-h-16 flex flex-col justify-end animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-200">
        <Link href={`/products/${product.slug}`} className="block group/title">
          <h3 className="text-sm md:text-base font-trendy font-semibold text-warm-gray-900 line-clamp-2 hover:text-primary-600 transition-all duration-300 group-hover/title:translate-x-0.5 group-hover/title:scale-[1.02] transform">
            {product.name}
          </h3>
        </Link>

        {/* Price Section - Always in consistent position */}
        <div className="flex items-baseline gap-2 flex-wrap animate-in fade-in-0 slide-in-from-bottom-1 duration-500 delay-300">
          {product.minPrice !== undefined &&
          product.maxPrice !== undefined &&
          product.minPrice !== product.maxPrice ? (
            <span className="text-sm md:text-base font-semibold text-warm-gray-900">
              {formatPriceRange(product.minPrice, product.maxPrice)}
            </span>
          ) : (
            <>
              <span className="text-sm md:text-base font-semibold text-warm-gray-900">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && originalPrice && (
                <span className="relative text-xs md:text-sm text-warm-gray-400 font-medium px-1.5 py-0.5 rounded-sm bg-linear-to-r from-warm-gray-100/50 to-transparent">
                  {formatPrice(originalPrice)}
                  {/* Modern diagonal strike-through */}
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-full h-px bg-linear-to-r from-transparent via-warm-gray-400 to-transparent transform rotate-12 origin-center opacity-80"></span>
                  </span>
                </span>
              )}
            </>
          )}
          {hasDiscount && discountPercent > 0 && originalPrice && (
            <span className="text-xs text-primary-600 font-medium bg-primary-50 px-1.5 py-0.5 rounded-full">
              Save {formatPrice(originalPrice - product.price)}
            </span>
          )}
        </div>

        {/* Rating Display - After price for consistency */}
        {product.rating && (
          <div className="mt-1 animate-in fade-in-0 slide-in-from-bottom-1 duration-500 delay-400">
            <StarRating
              rating={product.rating}
              reviewCount={product.reviewCount}
              size="sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}
