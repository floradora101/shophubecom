// SwipeRevealCard: Sorbé-style two-way compare slider
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SparkleEffect } from "./hero/shared/SparkleEffect";
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

  // Handle colors for price reveal - 2026 Red Theme
  const colors = {
    border: "border-primary-500/30",
    borderHover: "border-primary-500",
    bg: "bg-primary-600",
    text: "text-primary-600",
    icon: "text-white",
  };

  return (
    <div
      ref={cardRef}
      className={`relative w-full h-full min-h-[420px] sm:min-h-[480px] rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-md hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 ${
        isDragging ? "select-none scale-102 shadow-2xl" : ""
      }`}
      style={{
        touchAction: "pan-y",
        userSelect: isDragging ? "none" : undefined,
        WebkitUserSelect: isDragging ? "none" : undefined,
      }}
    >
      {/* Reveal Layer - Use standard ProductCard component */}
      <div className="absolute inset-0 z-0 bg-white">
        <div className="p-6 h-full flex flex-col items-center justify-center text-center">
          <div className="w-full max-w-[280px] sm:max-w-xs mx-auto">
            <ProductCard
              product={product}
              layout="vertical"
              hideDescription={true}
              className="items-center text-center"
            />
          </div>
        </div>
      </div>

      {/* Cover Layer - 2026 Premium Red Tech Design */}
      {revealType === "price" && (
        <div
          className={`absolute inset-0 z-10 ${
            isDragging ? "" : "transition-all duration-500 ease-out"
          }`}
          style={{ clipPath: coverClipPath }}
        >
          {/* Modern Background Effects matching Footer Subscription */}
          <div className="absolute inset-0 overflow-hidden bg-gray-900">
            <SparkleEffect count={15} className="opacity-30" />
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-600/20 blur-[100px] rounded-full animate-pulse-slow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-700/20 blur-[100px] rounded-full animate-pulse-slow" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(250,6,3,0.05)_0%,transparent_70%)]" />
          </div>

          {/* Product Image Overlay - Elegant Glassmorphism */}
          <div className="absolute inset-0 opacity-20">
            <Image
              src={productImage}
              alt={product.name}
              fill
              className="object-cover blur-xl scale-110"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="absolute inset-0 bg-gray-900/60" />

          {/* Content - Responsive sizing */}
          <div className="relative z-10 h-full w-full flex flex-col items-center justify-center text-center p-6 sm:p-8">
            {/* Premium badge - 2026 Style */}
            <div className="hero-glass flex items-center gap-2.5 px-2.5 py-1 rounded-lg border border-primary-500/30 shadow-lg mb-6 group">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-lg bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-lg h-2 w-2 bg-primary-600"></span>
              </div>
              <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-[0.2em]">
                Exclusive Reveal
              </span>
            </div>

            {/* Enhanced product image display - Red Glow Frame */}
            <div className="relative w-[85%] max-w-[250px] sm:max-w-[300px] aspect-square mx-auto mb-8 group">
              <div className="absolute -inset-4 bg-primary-600/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-md bg-gray-900/40 flex items-center justify-center">
                <div className="relative w-full h-full p-6 sm:p-8">
                  <Image
                    src={productImage}
                    alt={product.name}
                    fill
                    className="object-contain group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 640px) 85vw, 300px"
                  />
                </div>

                {/* 2026 Detail: Corner accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-l border-t border-primary-500/40"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-r border-t border-primary-500/40"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l border-b border-primary-500/40"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b border-primary-500/40"></div>
              </div>
            </div>

            <div className="space-y-3 w-full max-w-[280px] sm:max-w-xs mx-auto">
              <h3 className="text-xl sm:text-2xl font-display text-white drop-shadow-md line-clamp-2 leading-tight">
                {product.name}
              </h3>

              {/* Enhanced swipe hint */}
              <div className="mt-8 flex flex-col items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-400/80">
                  Swipe to Reveal Price
                </span>
                <div className="flex items-center gap-6">
                  <ArrowLeft className="h-4 w-4 text-primary-500 animate-[bounce-x_2s_infinite]" />
                  <div className="w-12 h-0.5 bg-linear-to-r from-transparent via-primary-500/40 to-transparent"></div>
                  <ArrowRight className="h-4 w-4 text-primary-500 animate-[bounce-x_2s_infinite_reverse]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Draggable Handle - Redesigned for 2026 */}
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
        {/* Divider Line with dynamic glow */}
        <div className={`absolute inset-y-0 w-0.5 bg-linear-to-b from-transparent via-primary-500 to-transparent transition-all duration-300 ${isDragging ? "opacity-100 shadow-[0_0_15px_rgba(255,26,23,0.8)]" : "opacity-40"}`}></div>

        {/* Handle Button - Primary Red Style consistent with design system */}
        <div className="relative group/handle-btn">
          {/* Outer Ring Glow - Persistent but subtle, expands on drag */}
          <div className={`absolute -inset-4 bg-primary-600/25 blur-lg rounded-full transition-all duration-500 ${isDragging ? "scale-150 opacity-100" : "scale-90 opacity-40 group-hover/handle-btn:opacity-100 group-hover/handle-btn:scale-110"}`}></div>

          <div className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-2xl transition-all duration-500 cursor-grab active:cursor-grabbing
            ${isDragging
              ? "scale-115 bg-primary-700 border-2 border-primary-400 ring-8 ring-primary-500/15"
              : "bg-primary-600 border-2 border-primary-500 hover:scale-110 hover:bg-primary-500 hover:shadow-primary-600/40"}
          `}>
            {/* Animated Arrows to reflect sliding mechanism */}
            <div className="flex items-center justify-center relative w-full h-full">
              <ArrowLeft
                className={`h-4 w-4 ${colors.icon} absolute transition-all duration-300
                  ${isDragging ? "-translate-x-3 opacity-100" : "-translate-x-1.5 opacity-90 group-hover/handle-btn:-translate-x-2.5 group-hover/handle-btn:opacity-100 animate-slide-arrows-reverse"}
                `}
                strokeWidth={3}
              />
              <ArrowRight
                className={`h-4 w-4 ${colors.icon} absolute transition-all duration-300
                  ${isDragging ? "translate-x-3 opacity-100" : "translate-x-1.5 opacity-90 group-hover/handle-btn:translate-x-2.5 group-hover/handle-btn:opacity-100 animate-slide-arrows"}
                `}
                strokeWidth={3}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
