// SwipeRevealCard: Sorbé-style two-way compare slider
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
    icon: "text-primary-600",
  };

  return (
    <div
      ref={cardRef}
      className={`relative w-full h-full min-h-[300px] md:min-h-[350px] rounded-xl overflow-hidden bg-white border border-gray-100 shadow-md hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 ${
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
        <div className="p-4 h-full flex items-center justify-center">
          <div className="w-3/4 max-w-xs">
            <ProductCard
              product={product}
              layout="vertical"
              hideDescription={true}
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
          {/* Deep Charcoal background with Red Glows */}
          <div className="absolute inset-0 bg-neutral-950 overflow-hidden">
            {/* Dynamic Red Glows - 2026 Style */}
            <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary-600/20 blur-[100px] rounded-full animate-pulse-slow"></div>
            <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-primary-600/15 blur-[80px] rounded-full animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>

            {/* Sophisticated Tech Grid overlay */}
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `linear-gradient(to right, #fa0603 1px, transparent 1px), linear-gradient(to bottom, #fa0603 1px, transparent 1px)`, backgroundSize: '32px 32px' }}></div>

            {/* Micro-dot pattern for detail */}
            <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: `radial-gradient(#fa0603 0.5px, transparent 0.5px)`, backgroundSize: '8px 8px' }}></div>
          </div>

          {/* Floating tech elements - Red Themed */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Subtle light beams */}
            <div className="absolute top-0 left-1/4 w-px h-full bg-linear-to-b from-transparent via-primary-500/20 to-transparent"></div>
            <div className="absolute top-0 right-1/4 w-px h-full bg-linear-to-b from-transparent via-primary-500/10 to-transparent"></div>

            {/* Animated particles */}
            <div
              className="absolute top-1/4 left-1/3 w-1 h-1 bg-primary-500/40 rounded-full animate-ping"
              style={{ animationDuration: '3s' }}
            ></div>
            <div
              className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-primary-600/30 rounded-full animate-ping"
              style={{ animationDuration: '4s', animationDelay: '1s' }}
            ></div>
          </div>

          {/* Product Image Overlay - Elegant Glassmorphism */}
          <div className="absolute inset-0 opacity-40">
            <Image
              src={productImage}
              alt={product.name}
              fill
              className="object-cover blur-md scale-110"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="absolute inset-0 bg-linear-to-b from-neutral-950/20 via-neutral-950/60 to-neutral-950/90"></div>

          {/* Content - Responsive sizing */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-6 sm:p-8">
            {/* Premium badge - 2026 Style */}
            <div className="hero-glass flex items-center gap-2.5 px-4 py-2 rounded-full border border-primary-500/30 shadow-lg mb-8 group">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-600"></span>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-[0.2em]">
                Exclusive Reveal
              </span>
            </div>

            {/* Enhanced product image display - Red Glow Frame */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto mb-8 group">
              <div className="absolute -inset-4 bg-primary-600/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-sm">
                <Image
                  src={productImage}
                  alt={product.name}
                  fill
                  className="object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                  sizes="208px"
                />

                {/* 2026 Detail: Corner accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-l border-t border-primary-500/40"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-r border-t border-primary-500/40"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l border-b border-primary-500/40"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b border-primary-500/40"></div>
              </div>
            </div>

            <div className="space-y-4 max-w-[200px] sm:max-w-xs">
              <h3 className="text-base sm:text-lg font-display text-white drop-shadow-md line-clamp-2 leading-snug">
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
        {/* Divider Line */}
        <div className={`absolute inset-y-0 w-px bg-linear-to-b from-transparent via-primary-500 to-transparent transition-opacity duration-300 ${isDragging ? 'opacity-100' : 'opacity-40'}`}></div>

        {/* Handle Button */}
        <div className="relative group">
          {/* Outer Ring Glow */}
          <div className={`absolute -inset-3 bg-primary-600/30 blur-md rounded-full transition-transform duration-300 ${isDragging ? 'scale-125 opacity-100' : 'scale-75 opacity-0 group-hover:opacity-100'}`}></div>

          <div className={`relative flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 border border-primary-500/50 shadow-2xl transition-all duration-300 ${isDragging ? 'scale-110 border-primary-400' : 'hover:scale-105'} cursor-grab active:cursor-grabbing`}>
            <div className="flex items-center gap-0.5">
              <ArrowLeft className="h-3.5 w-3.5 text-primary-500" strokeWidth={3} />
              <ArrowRight className="h-3.5 w-3.5 text-primary-500" strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
