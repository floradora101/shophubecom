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
      className={`relative w-full h-full min-h-[400px] md:min-h-[500px] rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ${
        isDragging ? "select-none scale-105 shadow-xl" : ""
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
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400 via-pink-400 to-orange-400 animate-pulse opacity-90">
            <div
              className="absolute inset-0 bg-gradient-to-tl from-primary-600/30 via-transparent to-purple-500/20 animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>

          {/* Floating geometric shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute top-10 left-10 w-16 h-16 bg-white/20 rounded-full animate-bounce"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute top-20 right-16 w-8 h-8 bg-white/30 rounded-lg rotate-45 animate-pulse"
              style={{ animationDelay: "1.2s" }}
            ></div>
            <div
              className="absolute bottom-20 left-20 w-12 h-12 bg-white/25 rounded-full animate-bounce"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="absolute bottom-32 right-12 w-6 h-6 bg-white/35 rounded-lg rotate-12 animate-pulse"
              style={{ animationDelay: "0.8s" }}
            ></div>
          </div>

          {/* Product Image - Blurred/Overlay with mystery effect */}
          <div className="absolute inset-0 opacity-95">
            <Image
              src={productImage}
              alt={product.name}
              fill
              className="object-cover blur-md scale-110"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Mystery overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-800/80 via-red-700/70 to-red-900/90"></div>
          </div>

          {/* Main Product Display with mystery elements */}
          <div className="relative z-10 text-center space-y-6 p-8">
            {/* Mystery badge with animated elements */}
            <div className="relative inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/95 backdrop-blur-sm border border-primary-200 shadow-xl mb-4">
              <div className="relative">
                <Tag className="h-5 w-5 text-primary-600 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-sm font-bold text-primary-700 font-[var(--font-poppins)] uppercase tracking-wide">
                Secret Deal
              </span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse"></div>
                <div
                  className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>

            {/* Product image with locked effect */}
            <div className="relative w-36 h-36 mx-auto">
              <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-white/50 shadow-2xl">
                <Image
                  src={productImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="144px"
                />
              </div>
              {/* Floating price hint */}
              <div className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-bounce">
                -{discountPercent}%
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xl font-bold text-white font-[var(--font-poppins)] drop-shadow-lg line-clamp-2">
                {product.name}
              </p>
              <div className="space-y-1">
                <p className="text-sm text-white/80 font-[var(--font-inter)]">
                  Sale Price
                </p>
                <p className="text-3xl font-black text-white font-[var(--font-poppins)] drop-shadow-xl">
                  {formatPrice(product.price)}
                </p>
              </div>
              {/* Swipe hint */}
              <div className="mt-4 flex items-center justify-center gap-2 text-white/70">
                <ArrowLeft className="h-4 w-4 animate-pulse" />
                <span className="text-xs font-medium">
                  Swipe to unlock savings
                </span>
                <ArrowRight className="h-4 w-4 animate-pulse" />
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
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 animate-pulse opacity-90">
            <div
              className="absolute inset-0 bg-gradient-to-tl from-purple-600/30 via-transparent to-pink-500/20 animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>

          {/* Floating package icons and shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute top-12 left-12 w-12 h-12 bg-white/20 rounded-lg rotate-12 animate-bounce"
              style={{ animationDelay: "0.3s" }}
            >
              <Package className="h-6 w-6 text-white m-3" />
            </div>
            <div
              className="absolute top-16 right-20 w-8 h-8 bg-white/30 rounded-full animate-pulse"
              style={{ animationDelay: "1.5s" }}
            ></div>
            <div
              className="absolute bottom-24 left-16 w-10 h-10 bg-white/25 rounded-lg -rotate-12 animate-bounce"
              style={{ animationDelay: "1.8s" }}
            >
              <Package className="h-5 w-5 text-white m-2.5" />
            </div>
            <div
              className="absolute bottom-16 right-8 w-6 h-6 bg-white/35 rounded-full animate-pulse"
              style={{ animationDelay: "0.7s" }}
            ></div>
          </div>

          {/* Product Image - Blurred/Overlay with mystery effect */}
          <div className="absolute inset-0 opacity-25">
            <Image
              src={productImage}
              alt={product.name}
              fill
              className="object-cover blur-md scale-110"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Mystery overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/50"></div>
          </div>

          {/* Main Product Display with bundle mystery */}
          <div className="relative z-10 text-center space-y-6 p-8">
            {/* Mystery bundle badge */}
            <div className="relative inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/95 backdrop-blur-sm border border-purple-200 shadow-xl mb-4">
              <div className="relative">
                <Package className="h-5 w-5 text-purple-600 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-sm font-bold text-purple-700 font-[var(--font-poppins)] uppercase tracking-wide">
                Smart Combo
              </span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                <div
                  className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>

            {/* Product image with bundle hint */}
            <div className="relative w-36 h-36 mx-auto">
              <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-white/50 shadow-2xl">
                <Image
                  src={productImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="144px"
                />
                {/* Bundle overlay with multiple items hint */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 flex items-end justify-center pb-3">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg"
                      >
                        <div className="w-4 h-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            +
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Bundle savings hint */}
              <div className="absolute -top-2 -right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-bounce">
                SAVE MORE
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xl font-bold text-white font-[var(--font-poppins)] drop-shadow-lg line-clamp-2">
                {product.name}
              </p>
              <div className="space-y-1">
                <p className="text-sm text-white/80 font-[var(--font-inter)]">
                  Plus complementary items
                </p>
                <p className="text-3xl font-black text-white font-[var(--font-poppins)] drop-shadow-xl">
                  {formatPrice(product.price)}
                </p>
              </div>
              {/* Swipe hint */}
              <div className="mt-4 flex items-center justify-center gap-2 text-white/70">
                <ArrowLeft className="h-4 w-4 animate-pulse" />
                <span className="text-xs font-medium">
                  Swipe for smart savings
                </span>
                <ArrowRight className="h-4 w-4 animate-pulse" />
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
        <div
          className={`flex items-center gap-1.5 ${
            isDragging ? "animate-pulse" : ""
          }`}
        >
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-full ${
              colors.bg
            } shadow-sm hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
              isDragging ? "scale-110 shadow-lg" : ""
            }`}
          >
            <ArrowLeft
              className={`h-3 w-3 text-white transition-transform duration-200 ${
                isDragging ? "animate-bounce" : ""
              }`}
              strokeWidth={2.5}
            />
          </div>
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-full ${
              colors.bg
            } shadow-sm hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
              isDragging ? "scale-110 shadow-lg" : ""
            }`}
          >
            <ArrowRight
              className={`h-3 w-3 text-white transition-transform duration-200 ${
                isDragging ? "animate-bounce" : ""
              }`}
              strokeWidth={2.5}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
