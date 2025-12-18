// Product card used across listings.
"use client";

import { MouseEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart } from "lucide-react";
import type { Product } from "@/lib/types/product.types";
import { getEffectiveStock, LOW_STOCK_THRESHOLD } from "@/lib/utils/inventory";
import { getProductImage } from "@/lib/utils/product-images";
import { useCart } from "@/lib/hooks/use-cart";

interface ProductCardProps {
  product: Product & {
    originalPrice?: number;
    discountPercent?: number;
  };
}

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem, toggleCart } = useCart();
  const router = useRouter();
  const imageUrl = getProductImage(product);
  const displayImage = imageError || !imageUrl ? PLACEHOLDER_IMAGE : imageUrl;
  const effectiveStock = getEffectiveStock(product);
  const isOutOfStock = effectiveStock === 0;

  // Compute variant count and selection requirement
  const variantCount = product.variants?.length ?? 0;
  const requiresSelection = variantCount !== 1; // multi-variant or invalid 0

  // Calculate discount info if available (direct sale or promotion)
  const originalPrice =
    product.discount?.originalPrice ?? product.originalPrice;
  const discountPercent =
    product.discount?.discountPercent ??
    product.discountPercent ??
    (originalPrice && originalPrice > product.price
      ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
      : 0);
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
    <div className="group relative flex flex-col bg-white rounded-xl overflow-hidden transition-all duration-300 border border-gray-100 hover:shadow-lg">
      {/* Discount Badge */}
      {hasDiscount && discountPercent > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-linear-to-br from-red-500 to-red-600 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-lg transform transition-all duration-300 hover:scale-105">
          -{discountPercent}%
        </div>
      )}

      {/* Wishlist Heart */}
      <button
        onClick={() => setIsWishlisted(!isWishlisted)}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200 ${
          isWishlisted
            ? "bg-primary-500 text-white"
            : "bg-white/90 text-gray-400 hover:text-primary-500 opacity-0 group-hover:opacity-100 shadow"
        }`}
        aria-label="Add to wishlist"
        suppressHydrationWarning
      >
        <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
      </button>

      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-white"
      >
        <Image
          src={displayImage}
          alt={product.name}
          fill
          className={`object-contain p-4 transition-transform duration-300 ${
            isOutOfStock ? "" : "group-hover:scale-105"
          }`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onError={() => setImageError(true)}
          unoptimized={displayImage.startsWith("data:")}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45">
            <span className="rounded bg-gray-900 px-3 py-1 text-sm font-semibold text-white">
              Out of Stock
            </span>
          </div>
        )}
        {effectiveStock > 0 && effectiveStock < LOW_STOCK_THRESHOLD && (
          <div className="absolute top-2 right-2 rounded bg-yellow-500 px-2 py-1 text-xs font-semibold text-white">
            Low Stock
          </div>
        )}

        {/* Hover CTA */}
        {!isOutOfStock && (
          <div
            className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/65 to-transparent opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200"
            aria-hidden="true"
          >
            <div className="flex justify-center">
              <button
                className="inline-flex items-center gap-2 bg-primary-500 text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-primary-600 transition-colors shadow"
                aria-label={
                  requiresSelection
                    ? `Select options for ${product.name}`
                    : `Add ${product.name} to cart`
                }
                onClick={handlePrimaryAction}
                suppressHydrationWarning
              >
                {requiresSelection ? (
                  "Select options"
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 text-center">
        {/* Category */}
        {product.category && (
          <Link
            href={`/products?category=${product.category.slug}`}
            className="text-[11px] font-medium text-gray-400 uppercase tracking-wide hover:text-primary-500 mb-1"
          >
            {product.category.name}
          </Link>
        )}

        {/* Title */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary-500 transition-colors leading-snug mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline justify-center gap-2 mb-2 flex-wrap">
          {product.minPrice !== undefined &&
          product.maxPrice !== undefined &&
          product.minPrice !== product.maxPrice ? (
            // Show price range for products with multiple variant prices
            <span className="text-base font-bold text-gray-900">
              ${product.minPrice.toFixed(0)} - ${product.maxPrice.toFixed(0)}
            </span>
          ) : (
            // Show single price for products with one price or no variants
            <span className="text-base font-bold text-gray-900">
              ${product.price.toFixed(0)}
            </span>
          )}
          {hasDiscount && originalPrice && (
            <span className="text-sm text-gray-400 line-through transition-opacity duration-300 ease-in-out">
              ${originalPrice.toFixed(0)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
