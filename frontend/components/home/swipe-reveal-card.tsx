// SwipeRevealCard: Sorbé-style two-way compare slider
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Tag,
  Package,
} from "lucide-react";
import {
  formatPrice,
  getProductImageWithPlaceholder,
  getDiscountInfo,
  getVariantId,
} from "@/lib/utils";
import { useCart } from "@/features/cart/hooks";
import type { Product } from "@/features/products/types";

interface SwipeRevealCardProps {
  product: Product;
  revealType: "price" | "bundle";
  complementaryProducts?: Product[];
  initialPosition?: number; // 0..1, default 1 (all reveal, cover hidden)
}

export function SwipeRevealCard({
  product,
  revealType,
  complementaryProducts = [],
  initialPosition = 1,
}: SwipeRevealCardProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isAddingAll, setIsAddingAll] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const didDragRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const { addItem, openCart } = useCart();

  // Get product image and discount info using shared utilities
  const productImage = getProductImageWithPlaceholder(product);
  const { hasDiscount, discountPercent, originalPrice, savings } =
    getDiscountInfo(product);

  // Clamp helper
  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  // Handle pointer events (only on handle)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!handleRef.current || !cardRef.current) return;

    // Prevent text selection during drag
    e.preventDefault();
    handleRef.current.setPointerCapture(e.pointerId);
    setIsDragging(true);
    didDragRef.current = false;
    startXRef.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !cardRef.current || !handleRef.current) return;
    if (!handleRef.current.hasPointerCapture(e.pointerId)) return;

    // Track if user actually dragged (more than 6px)
    if (!didDragRef.current) {
      if (Math.abs(e.clientX - startXRef.current) > 6) {
        didDragRef.current = true;
      }
    }

    // Compute position from absolute pointer X (clamp to 0..1 for completely closed/open)
    const rect = cardRef.current.getBoundingClientRect();
    const next = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    setPosition(next);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!handleRef.current) return;
    handleRef.current.releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    if (!handleRef.current) return;
    handleRef.current.releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  // Prevent navigation if user dragged
  const handleLinkClick = (e: React.MouseEvent) => {
    if (didDragRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
    didDragRef.current = false;
  };

  // Add single product to cart (for price reveal)
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const variantId = getVariantId(product);
    if (!variantId) {
      console.warn(`Cannot add "${product.name}": no variant ID found`);
      return;
    }

    try {
      await addItem(product, {
        variantId,
        quantity: 1,
      });
      openCart();
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  // Add all products to cart (main product + complementary products)
  const handleAddAllToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingAll) return;

    setIsAddingAll(true);

    try {
      // Dedupe products: [main, ...complementary] unique by product.id
      const allProducts = [product, ...complementaryProducts].filter(
        (p, index, self) => index === self.findIndex((p2) => p2.id === p.id)
      );

      const failures: string[] = [];

      // Add each product with minimal addItem signature
      for (const p of allProducts) {
        const variantId = getVariantId(p);
        if (!variantId) {
          failures.push(p.name || p.id);
          console.warn(
            `Skipping product "${p.name || p.id}": no variant ID found`
          );
          continue;
        }

        try {
          await addItem(p, {
            variantId,
            quantity: 1,
          });
        } catch (error) {
          failures.push(p.name || p.id);
          console.warn(`Failed to add "${p.name || p.id}" to cart:`, error);
        }
      }

      if (failures.length === 0) {
        openCart();
      } else if (failures.length < allProducts.length) {
        // Some succeeded, still open cart
        openCart();
        console.warn(
          `Added ${allProducts.length - failures.length} products, but ${
            failures.length
          } failed:`,
          failures
        );
      } else {
        console.error("Failed to add any products to cart:", failures);
      }
    } catch (error) {
      console.error("Error adding products to cart:", error);
    } finally {
      setIsAddingAll(false);
    }
  };

  // Cover clip path - clip from RIGHT (show LEFT part up to divider)
  const coverClipPath = `inset(0 ${(1 - position) * 100}% 0 0)`;

  // Handle color based on reveal type
  const handleColor = revealType === "price" ? "primary" : "purple";
  const handleColorClasses = {
    primary: {
      border: "border-primary-300",
      borderHover: "border-primary-500",
      bg: "bg-primary-400",
      text: "text-primary-600",
      icon: "text-primary-600",
    },
    purple: {
      border: "border-purple-300",
      borderHover: "border-purple-500",
      bg: "bg-purple-400",
      text: "text-purple-600",
      icon: "text-purple-600",
    },
  };
  const colors = handleColorClasses[handleColor];

  return (
    <div
      ref={cardRef}
      className={`relative w-full h-full min-h-[400px] md:min-h-[500px] rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-lg ${
        isDragging ? "select-none" : ""
      }`}
      style={{
        touchAction: "pan-y",
        userSelect: isDragging ? "none" : undefined,
        WebkitUserSelect: isDragging ? "none" : undefined,
      }}
    >
      {/* Reveal Layer - Always rendered full behind (z-0, no clip) */}
      {revealType === "price" && (
        <div className="absolute inset-0 z-0 bg-white group">
          <Link
            href={`/products/${product.slug}`}
            className="block h-full"
            onClick={handleLinkClick}
          >
            <div className="relative h-full flex flex-col">
              {/* Product Image */}
              <div className="relative flex-1 overflow-hidden">
                <Image
                  src={productImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {hasDiscount && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full shadow-lg">
                    <div className="text-2xl font-bold font-[var(--font-poppins)]">
                      -{discountPercent}%
                    </div>
                  </div>
                )}
                {/* Hover Overlay with Add to Cart */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button
                    onClick={handleAddToCart}
                    className="inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-semibold hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-xl transform translate-y-4 group-hover:translate-y-0"
                  >
                    <ShoppingCart className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="whitespace-nowrap">Add to Cart</span>
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 space-y-3 bg-white">
                <h3 className="text-lg font-semibold text-gray-900 font-[var(--font-poppins)] line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-primary-600 font-[var(--font-poppins)]">
                    {formatPrice(product.price)}
                  </span>
                  {hasDiscount && originalPrice && (
                    <>
                      <span className="text-lg text-gray-400 line-through font-[var(--font-inter)]">
                        {formatPrice(originalPrice)}
                      </span>
                      <span className="text-sm font-semibold text-green-600 font-[var(--font-inter)]">
                        Save {formatPrice(savings)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {revealType === "bundle" && (
        <div className="absolute inset-0 z-0 bg-white group">
          <div className="h-full flex flex-col">
            {/* Products Grid - Main product + Complementary products */}
            <div className="flex-1 bg-white flex flex-col min-h-0">
              {complementaryProducts.length > 0 ? (
                <>
                  {(() => {
                    // Bundle section: Dynamic based on complementaryProducts count
                    // If 1 complementary = 2 total products, if 3 complementary = 4 total products
                    const allProducts = [product, ...complementaryProducts];
                    const totalProducts = allProducts.length;
                    const isTwoProducts = totalProducts === 2;
                    const isFourProducts = totalProducts === 4;

                    // Use all available products (already limited by product-reveal-section)
                    const productsToShow = allProducts;

                    // Dynamic design: Adjust based on actual product count
                    // 2 products: Bigger cards to fill space
                    // 4 products: Smaller cards to fit grid
                    const cardPadding = isTwoProducts
                      ? "p-7"
                      : isFourProducts
                      ? "p-5"
                      : "p-6";
                    const imageSize = isTwoProducts
                      ? "w-40 h-40"
                      : isFourProducts
                      ? "w-28 h-28"
                      : "w-32 h-32";
                    const imageSizes = isTwoProducts
                      ? "160px"
                      : isFourProducts
                      ? "112px"
                      : "128px";
                    const gapSize = isTwoProducts
                      ? "gap-7"
                      : isFourProducts
                      ? "gap-5"
                      : "gap-6";
                    const textSize = isTwoProducts
                      ? "text-sm"
                      : isFourProducts
                      ? "text-xs"
                      : "text-sm";
                    const priceSize = isTwoProducts
                      ? "text-sm"
                      : isFourProducts
                      ? "text-xs"
                      : "text-sm";
                    const gridPadding = isTwoProducts
                      ? "p-7"
                      : isFourProducts
                      ? "p-5"
                      : "p-6";

                    return (
                      <div className="relative flex-1 min-h-0">
                        <div
                          className={`grid grid-cols-2 ${gapSize} ${gridPadding} flex-shrink-0`}
                        >
                          {productsToShow.map((p) => {
                            const isMainProduct = p.id === product.id;
                            const prodImage = isMainProduct
                              ? productImage
                              : getProductImageWithPlaceholder(p);
                            const {
                              hasDiscount: prodHasDiscount,
                              discountPercent: prodDiscountPercent,
                              originalPrice: prodOriginalPrice,
                            } = getDiscountInfo(p);

                            return (
                              <Link
                                key={p.id}
                                href={`/products/${p.slug}`}
                                onClick={handleLinkClick}
                                className={`group flex flex-col bg-white border border-gray-200 rounded-lg ${cardPadding} hover:border-primary-300 hover:shadow-sm transition-all h-full`}
                              >
                                {/* Product Image - Top */}
                                <div
                                  className={`relative ${imageSize} flex-shrink-0 overflow-hidden bg-gray-50 rounded-md ${
                                    isTwoProducts ? "mb-3" : "mb-2"
                                  }`}
                                >
                                  <Image
                                    src={prodImage}
                                    alt={p.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    sizes={imageSizes}
                                  />
                                  {prodHasDiscount &&
                                    prodDiscountPercent > 0 && (
                                      <div className="absolute top-1 left-1 z-10">
                                        <div className="font-bold shadow-sm bg-gradient-to-br from-red-500 to-red-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                                          -{prodDiscountPercent}%
                                        </div>
                                      </div>
                                    )}
                                </div>
                                {/* Product Info - Bottom */}
                                <div className="flex-1 flex flex-col justify-end min-w-0 mt-auto">
                                  <h4
                                    className={`font-trendy font-semibold text-gray-900 line-clamp-2 ${textSize} leading-tight group-hover:text-primary-600 transition-colors mb-0.5`}
                                  >
                                    {p.name}
                                  </h4>
                                  <div className="flex items-baseline gap-1 flex-wrap">
                                    <span
                                      className={`font-semibold text-gray-900 ${priceSize}`}
                                    >
                                      {formatPrice(p.price)}
                                    </span>
                                    {prodHasDiscount && prodOriginalPrice && (
                                      <span className="text-[10px] text-gray-500 line-through">
                                        {formatPrice(prodOriginalPrice)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                        {/* Hover Overlay with Add All to Cart - Same position as price reveal */}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button
                            onClick={handleAddAllToCart}
                            disabled={isAddingAll}
                            className="inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-semibold hover:bg-gray-900 hover:text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-xl transform translate-y-4 group-hover:translate-y-0"
                          >
                            <ShoppingCart className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            <span className="whitespace-nowrap">
                              {isAddingAll ? "Adding…" : "Add All to Cart"}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <p className="text-sm font-[var(--font-inter)]">
                    No complementary products available
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cover Layer - Always rendered, clipped from right (z-10) */}
      {revealType === "price" && (
        <div
          className={`absolute inset-0 z-10 ${
            isDragging ? "" : "transition-all duration-300 ease-out"
          }`}
          style={{ clipPath: coverClipPath }}
        >
          <div className="relative h-full bg-gradient-to-br from-primary-50 via-cream-50 to-primary-100 flex flex-col items-center justify-center p-8">
            {/* Product Image - Blurred/Overlay */}
            <div className="absolute inset-0 opacity-20">
              <Image
                src={productImage}
                alt={product.name}
                fill
                className="object-cover blur-sm"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Main Product Display - Centered like bundle cover */}
            <div className="relative z-10 text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-primary-200 mb-4">
                <Tag className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-semibold text-primary-700 font-[var(--font-poppins)]">
                  Regular Price
                </span>
              </div>
              <div className="relative w-32 h-32 mx-auto rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                <Image
                  src={productImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-900 font-[var(--font-poppins)]">
                  {product.name}
                </p>
                <p className="text-2xl font-bold text-primary-600 font-[var(--font-poppins)]">
                  {formatPrice(originalPrice || product.price)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {revealType === "bundle" && (
        <div
          className={`absolute inset-0 z-10 ${
            isDragging ? "" : "transition-all duration-300 ease-out"
          }`}
          style={{ clipPath: coverClipPath }}
        >
          <div className="relative h-full bg-gradient-to-br from-purple-50 via-pink-50 to-primary-100 flex flex-col items-center justify-center p-8">
            {/* Product Image - Blurred/Overlay */}
            <div className="absolute inset-0 opacity-20">
              <Image
                src={productImage}
                alt={product.name}
                fill
                className="object-cover blur-sm"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Main Product Display */}
            <div className="relative z-10 text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-purple-200 mb-4">
                <Package className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-700 font-[var(--font-poppins)]">
                  Frequently Bought Together
                </span>
              </div>
              <div className="relative w-32 h-32 mx-auto rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                <Image
                  src={productImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-900 font-[var(--font-poppins)]">
                  {product.name}
                </p>
                <p className="text-2xl font-bold text-primary-600 font-[var(--font-poppins)]">
                  {formatPrice(product.price)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Draggable Handle at Divider Position */}
      <div
        ref={handleRef}
        className="absolute top-0 bottom-0 z-20 flex items-center justify-center select-none"
        style={{
          left: `${position * 100}%`,
          transform: "translateX(-50%)",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {/* Handle Container - Circular arrows only */}
        <div className="flex items-center gap-1.5">
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-full ${colors.bg} shadow-sm hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200 cursor-grab active:cursor-grabbing select-none`}
          >
            <ArrowLeft className="h-3 w-3 text-white" strokeWidth={2.5} />
          </div>
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-full ${colors.bg} shadow-sm hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200 cursor-grab active:cursor-grabbing select-none`}
          >
            <ArrowRight className="h-3 w-3 text-white" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </div>
  );
}


