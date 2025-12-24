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

interface ProductCardProps {
  product: Product & {
    originalPrice?: number;
    discountPercent?: number;
  };
}

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, toggleCart } = useCart();
  const router = useRouter();
  const [imageError, setImageError] = React.useState(false);

  const primaryImage =
    product.defaultVariant?.image || product.defaultVariant?.images?.[0];
  const hoverImage = product.defaultVariant?.images?.[1] || primaryImage;
  const displayImage =
    imageError || !primaryImage ? PLACEHOLDER_IMAGE : primaryImage;
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
    <div className="group flex flex-col">
      {/* Image Card Section */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square rounded-2xl overflow-hidden transition-all duration-300 border border-warm-gray-200 hover:border-warm-gray-300 hover:shadow-lg bg-white"
      >
        {/* Full Image Background */}
        <div className="absolute inset-0">
          {/* Primary Image */}
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className={`object-cover transition-opacity duration-500 ${
              showHoverImage
                ? "opacity-100 group-hover:opacity-0"
                : "opacity-100"
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
              className="object-cover transition-opacity duration-500 absolute inset-0 opacity-0 group-hover:opacity-100"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized={hoverImage.startsWith("data:")}
            />
          )}
        </div>

        {/* Discount Badge */}
        {hasDiscount && discountPercent > 0 && (
          <div className="absolute top-3 left-3 z-20">
            <div className="font-bold text-xs md:text-sm px-2.5 md:px-3 py-1 md:py-1.5 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg">
              <Sparkles className="h-3 w-3 inline-block mr-1 animate-bounce-slow" />
              <span>-{discountPercent}% OFF</span>
            </div>
          </div>
        )}

        {/* Limited time badge */}
        {hasDiscount && discountPercent > 0 && (
          <div className="absolute top-3 right-3 z-20">
            <div className="bg-white/95 backdrop-blur-sm text-xs font-semibold border border-primary-300 text-primary-700 px-2 py-1 rounded-lg">
              <Clock className="h-3 w-3 inline-block mr-1" />
              Limited
            </div>
          </div>
        )}

        {/* Low Stock Badge - only show if no discount badges */}
        {effectiveStock > 0 &&
          effectiveStock < LOW_STOCK_THRESHOLD &&
          !hasDiscount && (
            <div className="absolute top-3 right-3 z-20 rounded-lg bg-yellow-500 px-2.5 py-1 text-xs font-semibold text-white shadow-lg">
              Low Stock
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
            className="absolute inset-0 flex items-center justify-center transition-all duration-300 z-30 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <button
              className="inline-flex items-center gap-2 bg-white text-warm-gray-900 px-5 py-2.5 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-semibold hover:bg-warm-gray-900 hover:text-white transition-all duration-300 shadow-xl transform translate-y-4 group-hover:translate-y-0"
              aria-label={
                requiresSelection
                  ? `Select options for ${product.name}`
                  : `Add ${product.name} to cart`
              }
              onClick={handlePrimaryAction}
            >
              <ShoppingCart className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="whitespace-nowrap">
                {requiresSelection ? "Select Option" : "Add to Cart"}
              </span>
            </button>
          </div>
        )}
      </Link>

      {/* Product Info Below Image */}
      <div className="mt-3 space-y-1">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="text-sm md:text-base font-trendy font-semibold text-warm-gray-900 line-clamp-2 hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2 flex-wrap">
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
                <span className="text-xs md:text-sm text-warm-gray-500 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </>
          )}
          {hasDiscount && discountPercent > 0 && originalPrice && (
            <span className="text-xs text-primary-600 font-medium">
              Save {formatPrice(originalPrice - product.price)}
            </span>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-bounce-slow {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
