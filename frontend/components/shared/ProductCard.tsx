// Product card used across listings - Sorbé style: full image card with title/price below
"use client";

import React, { MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/features/products/types";
import {
  getEffectiveStock,
  LOW_STOCK_THRESHOLD,
} from "@/features/products/utils/inventory";
import { useCart } from "@/features/cart/hooks";
import { useFavorites } from "@/features/favorites";
import { formatPrice, formatPriceRange } from "@/lib/utils/price";
import {
  getProductImageWithPlaceholder,
  getDiscountInfo,
} from "@/lib/utils/products";
import { getAllProductImages } from "@/features/products/utils/product-images";
import { StarRating } from "@/components/ui/star-rating";
import { cn } from "@/lib/utils/cn";
import { logError, extractErrorMessage } from "@/lib/errors";

interface ProductCardProps {
  product: Product & {
    originalPrice?: number;
    discountPercent?: number;
  };
  compact?: boolean;
  layout?: "horizontal" | "vertical";
  hideDescription?: boolean;
  className?: string;
  /** When true, shows the Add to Cart button below the card instead of on hover */
  showButtonBelow?: boolean;
  /** Custom click handler for the image - when provided, replaces default navigation */
  onImageClick?: () => void;
}

export function ProductCard({
  product,
  compact = false,
  layout = "horizontal",
  hideDescription = false,
  className,
  showButtonBelow = false,
  onImageClick,
}: ProductCardProps) {
  const { addItem, toggleCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
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

  // Determine if this product has variant price ranges
  const hasPriceRange =
    product.minPrice !== undefined &&
    product.maxPrice !== undefined &&
    product.minPrice !== product.maxPrice;

  // Calculate discount info using utility function
  const discountInfo = getDiscountInfo(product);
  let { hasDiscount, discountPercent, originalPrice } = discountInfo;

  // For products with price ranges, only show discount if all variants have the same price
  // or if the discount applies to the base price range
  if (hasPriceRange && variantCount > 1) {
    const variantPrices = product.variants?.map((v) => v.price) || [];
    const uniquePrices = [...new Set(variantPrices)];
    // Only show discount if all variants have the same price
    if (uniquePrices.length !== 1) {
      hasDiscount = false;
      discountPercent = 0;
      originalPrice = null;
    }
  }

  // Ensure discountPercent is a valid number and greater than 0
  if (
    hasDiscount &&
    (!discountPercent || discountPercent <= 0 || !originalPrice)
  ) {
    hasDiscount = false;
    discountPercent = 0;
    originalPrice = null;
  }

  const handlePrimaryAction = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (requiresSelection) {
      // Multiple variants or no variants - navigate to product detail page
      router.push(`/products/${product.slug}`);
    } else {
      // Exactly 1 variant - quick add with that variant
      const variant = product.variants![0];
      if (!variant?.id) {
        toast.error("Unable to add item to cart. Please try again.");
        return;
      }

      try {
        await addItem(product, {
          variantId: variant.id,
          variantSku: variant.sku ?? null,
          selectedOptions: variant.options as Record<string, string>,
        });
        toast.success(`${product.name} added to cart!`);
        toggleCart(true);
      } catch (error: unknown) {
        logError(error, {
          component: "ProductCard",
          action: "add_to_cart",
          metadata: {
            productId: product.id,
            productSlug: product.slug,
            variantId: variant.id,
            variantSku: variant.sku ?? null,
          },
        });
        toast.error(extractErrorMessage(error, "Failed to add item to cart"));
      }
    }
  };

  return (
    <div
      className={cn(
        "group w-full",
        layout === "horizontal"
          ? "flex flex-row gap-4 items-start"
          : "flex flex-col",
        className
      )}
    >
      {/* Title Section - On left for horizontal layout */}
      {layout === "horizontal" && (
        <div className={cn("flex-1 space-y-1.5", compact && "space-y-1")}>
          {/* Product Name */}
          <Link
            href={`/products/${product.slug}`}
            className="block group/title"
          >
            <h3
              className={cn(
                "font-medium text-warm-gray-800 line-clamp-2 transition-colors duration-200 group-hover/title:text-primary-600",
                compact ? "text-[11px]" : "text-sm"
              )}
            >
              {product.name}
            </h3>
          </Link>

          {/* Product Description */}
          {product.description && !hideDescription && (
            <p
              className={cn(
                "text-warm-gray-400 line-clamp-2 leading-relaxed",
                compact ? "text-[10px]" : "text-xs"
              )}
            >
              {product.description}
            </p>
          )}

          {/* Rating Display */}
          {product.rating && (
            <div className={compact ? "pt-0" : "pt-0.5"}>
              <StarRating
                rating={product.rating}
                reviewCount={product.reviewCount}
                size="sm"
              />
            </div>
          )}

          {/* Price Row */}
          <div className={cn("flex items-center gap-2", compact && "gap-1.5")}>
            {hasPriceRange ? (
              <span
                className={cn(
                  "font-medium text-warm-gray-800",
                  compact ? "text-[11px]" : "text-sm"
                )}
              >
                {formatPriceRange(product.minPrice!, product.maxPrice!)}
              </span>
            ) : (
              <>
                <span
                  className={cn(
                    "font-medium text-warm-gray-800",
                    compact ? "text-[11px]" : "text-sm"
                  )}
                >
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && originalPrice && (
                  <span
                    className={cn(
                      "text-warm-gray-400 line-through",
                      compact ? "text-[10px]" : "text-xs"
                    )}
                  >
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Image Card Section */}
      <div
        className={cn(
          "relative group/card-container",
          layout === "horizontal"
            ? compact
              ? "aspect-square w-24 h-24 shrink-0"
              : "aspect-square w-full max-w-48 shrink-0"
            : "aspect-square w-full"
        )}
      >
        {/* Card Container - Minimal with soft background */}
        {onImageClick ? (
          <div
            onClick={onImageClick}
            className="relative block w-full h-full rounded-xl overflow-hidden bg-warm-gray-50/60 transition-all duration-300 ease-out group-hover/card-container:bg-warm-gray-100/70 group/card cursor-pointer"
          >
            {/* Image - edge to edge, minimal padding */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Primary Image */}
              <Image
                src={displayImage}
                alt={product.name}
                fill
                className={cn(
                  "object-cover transition-all duration-500 ease-out",
                  "p-0",
                  showHoverImage
                    ? "opacity-100 group-hover/card-container:opacity-0"
                    : "opacity-100 group-hover/card-container:scale-105"
                )}
                sizes={compact ? "96px" : "25vw"}
                onError={() => setImageError(true)}
                unoptimized={displayImage.startsWith("data:")}
              />
              {/* Hover Image */}
              {showHoverImage && (
                <Image
                  src={hoverImage!}
                  alt={product.name}
                  fill
                  className={cn(
                    "object-cover transition-all duration-500 ease-out absolute inset-0 opacity-0 group-hover/card-container:opacity-100 group-hover/card-container:scale-105",
                    "p-0"
                  )}
                  sizes={compact ? "96px" : "25vw"}
                  unoptimized={hoverImage.startsWith("data:")}
                />
              )}
            </div>
          </div>
        ) : (
          <Link
            href={`/products/${product.slug}`}
            className="relative block w-full h-full rounded-xl overflow-hidden bg-warm-gray-50/60 transition-all duration-300 ease-out group-hover/card-container:bg-warm-gray-100/70 group/card"
          >
            {/* Image - edge to edge, minimal padding */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Primary Image */}
              <Image
                src={displayImage}
                alt={product.name}
                fill
                className={cn(
                  "object-cover transition-all duration-500 ease-out",
                  "p-0",
                  showHoverImage
                    ? "opacity-100 group-hover/card-container:opacity-0"
                    : "opacity-100 group-hover/card-container:scale-105"
                )}
                sizes={compact ? "96px" : "25vw"}
                onError={() => setImageError(true)}
                unoptimized={displayImage.startsWith("data:")}
              />
              {/* Hover Image */}
              {showHoverImage && (
                <Image
                  src={hoverImage!}
                  alt={product.name}
                  fill
                  className={cn(
                    "object-cover transition-all duration-500 ease-out absolute inset-0 opacity-0 group-hover/card-container:opacity-100 group-hover/card-container:scale-105",
                    "p-0"
                  )}
                  sizes={compact ? "96px" : "25vw"}
                  unoptimized={hoverImage.startsWith("data:")}
                />
              )}
            </div>
          </Link>
        )}

        {/* Discount Badge */}
        {hasDiscount && discountPercent > 0 && !hasPriceRange && (
          <div
            className={cn(
              "absolute z-20 pointer-events-none",
              compact ? "top-2 left-2" : "top-2.5 left-2.5"
            )}
          >
            <div
              className={cn(
                "font-medium text-white rounded-md bg-primary-500",
                compact
                  ? "text-[9px] px-1.5 py-0.5"
                  : "text-[10px] px-2 py-0.5"
              )}
            >
              {discountPercent}% OFF
            </div>
          </div>
        )}

        {/* Low Stock Badge */}
        {effectiveStock > 0 &&
          effectiveStock < LOW_STOCK_THRESHOLD &&
          !hasDiscount && (
            <div
              className={cn(
                "absolute z-20 pointer-events-none",
                compact ? "top-2 left-2" : "top-2.5 left-2.5"
              )}
            >
              <div
                className={cn(
                  "rounded-md bg-primary-500 font-medium text-white flex items-center gap-1",
                  compact
                    ? "px-1.5 py-0.5 text-[9px]"
                    : "px-2 py-0.5 text-[10px]"
                )}
              >
                <span className="relative flex h-1 w-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1 w-1 bg-white"></span>
                </span>
                <span>{effectiveStock} left</span>
              </div>
            </div>
          )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-warm-gray-50/90 backdrop-blur-[2px] z-30 pointer-events-none rounded-xl">
            <span className="bg-warm-gray-900 text-white px-3 py-1 rounded-md text-[10px] font-medium tracking-wide uppercase">
              Sold Out
            </span>
          </div>
        )}

        {/* Hover Actions - Only show when not using showButtonBelow */}
        {!isOutOfStock && !showButtonBelow && (
          <>
            {/* Favorites Heart - Minimal circular button */}
            <button
              className={cn(
                "absolute z-30 rounded-full bg-white/90 backdrop-blur-sm transition-all duration-300 ease-out hover:bg-white hover:scale-110 hover:rotate-12 hover:shadow-lg hover:-translate-y-0.5 opacity-0 group-hover/card-container:opacity-100 pointer-events-auto cursor-pointer",
                compact ? "top-2 right-2 p-1.5" : "top-2.5 right-2.5 p-2"
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(product.id);
              }}
              aria-label={
                isFavorite(product.id)
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
            >
              <Heart
                className={cn(
                  "transition-all duration-300 ease-out hover:animate-pulse",
                  compact ? "h-3 w-3" : "h-3.5 w-3.5",
                  isFavorite(product.id)
                    ? "fill-primary-500 text-primary-500"
                    : "text-warm-gray-500 hover:text-primary-500"
                )}
              />
            </button>

            {/* Quick Add Button - Minimal bottom bar */}
            <button
              className={cn(
                "absolute z-30 left-1/2 -translate-x-1/2 inline-flex items-center justify-center bg-primary-500 text-white font-medium transition-all duration-300 ease-out hover:bg-primary-600 hover:scale-105 hover:shadow-lg hover:-translate-y-1 active:scale-95 opacity-0 translate-y-1 group-hover/card-container:opacity-100 group-hover/card-container:translate-y-0 pointer-events-auto cursor-pointer rounded-md shadow-sm",
                compact
                  ? "bottom-2 p-1.5"
                  : "bottom-3 gap-1.5 px-3.5 py-1.5 text-[11px]"
              )}
              aria-label={
                requiresSelection
                  ? `Select options for ${product.name}`
                  : `Add ${product.name} to cart`
              }
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePrimaryAction(e);
              }}
            >
              <ShoppingCart
                className={cn(
                  "transition-transform duration-300 ease-out hover:scale-110 hover:rotate-6",
                  compact ? "h-3 w-3" : "h-3.5 w-3.5"
                )}
              />
              {!compact && (
                <span className="whitespace-nowrap tracking-wide">
                  {requiresSelection ? "Select" : "Add to Cart"}
                </span>
              )}
            </button>
          </>
        )}
      </div>

      {/* Button Below Card - Always visible when showButtonBelow is true */}
      {showButtonBelow && !isOutOfStock && (
        <div className="mt-4 flex justify-center">
          <button
            className="inline-flex items-center gap-2 bg-primary-500 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-lg text-xs md:text-sm font-semibold hover:bg-primary-600 hover:scale-105 hover:shadow-xl hover:shadow-primary-500/25 hover:-translate-y-0.5 active:bg-primary-700 active:scale-95 active:translate-y-0 transition-all duration-300 ease-out shadow-lg cursor-pointer"
            aria-label={
              requiresSelection
                ? `Select options for ${product.name}`
                : `Add ${product.name} to cart`
            }
            onClick={handlePrimaryAction}
          >
            <ShoppingCart className="h-3.5 w-3.5 md:h-4 md:w-4 transition-transform duration-300 group-hover:scale-110" />
            <span className="whitespace-nowrap">
              {requiresSelection ? "Select Option" : "Add to Cart"}
            </span>
          </button>
        </div>
      )}

      {/* Product Info - Only for vertical layout */}
      {layout !== "horizontal" && (
        <div className={cn("mt-3 space-y-1.5", compact && "mt-2 space-y-1")}>
          {/* Product Name */}
          <Link
            href={`/products/${product.slug}`}
            className="block group/title"
          >
            <h3
              className={cn(
                "font-medium text-warm-gray-800 line-clamp-2 transition-colors duration-200 group-hover/title:text-primary-600",
                compact ? "text-[11px]" : "text-sm"
              )}
            >
              {product.name}
            </h3>
          </Link>

          {/* Product Description */}
          {product.description && !hideDescription && (
            <p
              className={cn(
                "text-warm-gray-400 line-clamp-2 leading-relaxed",
                compact ? "text-[10px]" : "text-xs"
              )}
            >
              {product.description}
            </p>
          )}

          {/* Rating Display */}
          {product.rating && (
            <div className={compact ? "pt-0" : "pt-0.5"}>
              <StarRating
                rating={product.rating}
                reviewCount={product.reviewCount}
                size="sm"
              />
            </div>
          )}

          {/* Price Row - Clean minimal */}
          <div className={cn("flex items-center gap-2", compact && "gap-1.5")}>
            {hasPriceRange ? (
              <span
                className={cn(
                  "font-medium text-warm-gray-800",
                  compact ? "text-[11px]" : "text-sm"
                )}
              >
                {formatPriceRange(product.minPrice!, product.maxPrice!)}
              </span>
            ) : (
              <>
                <span
                  className={cn(
                    "font-medium text-warm-gray-800",
                    compact ? "text-[11px]" : "text-sm"
                  )}
                >
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && originalPrice && (
                  <span
                    className={cn(
                      "text-warm-gray-400 line-through",
                      compact ? "text-[10px]" : "text-xs"
                    )}
                  >
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
