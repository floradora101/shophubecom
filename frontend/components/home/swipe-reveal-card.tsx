// SwipeRevealCard: Sorbé-style two-way compare slider
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Tag } from "lucide-react";
import { getProductImageWithPlaceholder } from "@/lib/utils";
import { ProductCard } from "@/features/products/components/ProductCard";
import type { Product } from "@/features/products/types";

interface SwipeRevealCardProps {
  product: Product;
  revealType: "price";
  initialPosition?: number; // 0..1, default 1 (all reveal, cover hidden)
}

export function SwipeRevealCard({
  product,
  revealType,
  initialPosition = 1,
}: SwipeRevealCardProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const didDragRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);

  // Get product image using shared utilities
  const productImage = getProductImageWithPlaceholder(product);

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

  // Cover clip path - clip from RIGHT (show LEFT part up to divider)
  const coverClipPath = `inset(0 ${(1 - position) * 100}% 0 0)`;

  // Handle colors for price reveal
  const colors = {
    border: "border-primary-300",
    borderHover: "border-primary-500",
    bg: "bg-primary-400",
    text: "text-primary-600",
    icon: "text-primary-600",
  };

  return (
    <div
      ref={cardRef}
      className={`relative w-full h-full min-h-[300px] md:min-h-[350px] rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ${
        isDragging ? "select-none scale-105 shadow-xl" : ""
      }`}
      style={{
        touchAction: "pan-y",
        userSelect: isDragging ? "none" : undefined,
        WebkitUserSelect: isDragging ? "none" : undefined,
      }}
    >
      {/* Reveal Layer - Use standard ProductCard component */}
      <div className="absolute inset-0 z-0 bg-white">
        <div className="p-4 h-full">
          <ProductCard product={product} layout="vertical" />
        </div>
      </div>

      {/* Cover Layer - Always rendered, clipped from right (z-10) */}
      {revealType === "price" && (
        <div
          className={`absolute inset-0 z-10 ${
            isDragging ? "" : "transition-all duration-300 ease-out"
          }`}
          style={{ clipPath: coverClipPath }}
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-warm-gray-600 via-warm-gray-700 to-warm-gray-800 animate-pulse opacity-90">
            <div
              className="absolute inset-0 bg-gradient-to-tl from-primary-600/30 via-transparent to-primary-400/20 animate-pulse"
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
            <div className="absolute inset-0 bg-gradient-to-br from-warm-gray-700/80 via-warm-gray-800/70 to-warm-gray-900/90"></div>
          </div>

          {/* Main Product Display with mystery elements */}
          <div className="relative z-10 text-center space-y-6 p-8">
            {/* Mystery badge with animated elements */}
            <div className="relative inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/95 backdrop-blur-sm border border-primary-200 shadow-xl mb-4">
              <div className="relative">
                <Tag className="h-5 w-5 text-primary-600 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-sm font-bold text-primary-600 font-[var(--font-inter)] uppercase tracking-wide">
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
            </div>

            <div className="space-y-3">
              <p className="text-base text-white font-[var(--font-inter)] drop-shadow-lg line-clamp-2">
                {product.name}
              </p>
              {/* Swipe hint */}
              <div className="mt-4 flex items-center justify-center gap-2 text-white/70">
                <ArrowLeft className="h-4 w-4 animate-pulse" />
                <span className="text-xs font-medium">Swipe to reveal</span>
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
