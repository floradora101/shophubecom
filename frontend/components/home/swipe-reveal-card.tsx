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

  // Handle colors for price reveal
  const colors = {
    border: "border-gray-300",
    borderHover: "border-gray-500",
    bg: "bg-gray-400",
    text: "text-gray-600",
    icon: "text-gray-600",
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

      {/* Cover Layer - Premium Tech Design */}
      {revealType === "price" && (
        <div
          className={`absolute inset-0 z-10 ${
            isDragging ? "" : "transition-all duration-300 ease-out"
          }`}
          style={{ clipPath: coverClipPath }}
        >
          {/* Premium metallic gradient background with gray tones */}
          <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Primary metallic gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-tl from-gray-800/50 via-slate-700/40 to-zinc-800/50"></div>

            {/* Secondary accent gradient */}
            <div
              className="absolute inset-0 bg-linear-to-r from-gray-600/15 via-transparent to-slate-600/15 animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>

            {/* Tech circuit pattern overlay */}
            <div className="absolute inset-0 opacity-20">
              <svg
                className="w-full h-full"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="circuit-pattern"
                    x="0"
                    y="0"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M20 0v20m0 0h20m-20 0v20m0-20h-20"
                      stroke="currentColor"
                      strokeWidth="0.5"
                      className="text-gray-400/60"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="1"
                      fill="currentColor"
                      className="text-slate-400/40"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
              </svg>
            </div>
          </div>

          {/* Floating tech elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Hexagonal nodes */}
            <div
              className="absolute top-12 left-8 w-12 h-12 border border-gray-400/30 rotate-45 animate-pulse"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="absolute inset-1 border border-slate-300/20 rotate-12"></div>
            </div>
            <div
              className="absolute top-24 right-12 w-8 h-8 border border-zinc-400/40 rotate-12 animate-pulse"
              style={{ animationDelay: "1.8s" }}
            >
              <div className="absolute inset-0.5 border border-zinc-300/30"></div>
            </div>

            {/* Circuit connections */}
            <div
              className="absolute bottom-16 left-12 w-20 h-px bg-linear-to-r from-transparent via-gray-400/60 to-transparent animate-pulse"
              style={{ animationDelay: "1.2s" }}
            ></div>
            <div
              className="absolute bottom-20 right-8 w-16 h-px bg-linear-to-r from-transparent via-slate-400/50 to-transparent animate-pulse"
              style={{ animationDelay: "2.5s" }}
            ></div>

            {/* Data flow particles */}
            <div
              className="absolute bottom-24 left-16 w-2 h-2 bg-gray-400/80 rounded-full animate-bounce"
              style={{ animationDelay: "0.8s" }}
            ></div>
            <div
              className="absolute bottom-28 right-16 w-1.5 h-1.5 bg-slate-400/70 rounded-full animate-bounce"
              style={{ animationDelay: "1.5s" }}
            ></div>
          </div>

          {/* Product Image - Enhanced tech overlay */}
          <div className="absolute inset-0 opacity-80">
            <Image
              src={productImage}
              alt={product.name}
              fill
              className="object-cover blur-sm scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Tech scan lines effect */}
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-slate-900/20 to-slate-900/40">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(107,114,128,0.03)_2px,rgba(107,114,128,0.03)_4px)] animate-pulse"></div>
            </div>
          </div>

          {/* Premium Tech Content */}
          <div className="relative z-10 text-center space-y-6 p-8">
            {/* Tech badge with premium styling - responsive sizing */}
            <div className="relative inline-flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-xl sm:rounded-2xl bg-gray-800/95 backdrop-blur-xl border border-gray-600/50 shadow-2xl mb-4">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-linear-to-r from-gray-500/20 via-gray-500/20 to-gray-500/20 blur-sm"></div>

              <div className="relative flex items-center gap-2 sm:gap-3">
                {/* Tech icon - smaller on mobile */}
                <div className="relative">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 border border-gray-400/60 rounded rotate-45 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-ping opacity-75"></div>
                </div>

                <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Premium Deal
                </span>

                {/* Status indicators - smaller on mobile */}
                <div className="flex gap-1 sm:gap-1.5">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.3s" }}
                  ></div>
                  <div
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.6s" }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Enhanced product image display */}
            <div className="relative w-40 h-40 mx-auto">
              <div className="relative w-full h-full rounded-3xl overflow-hidden border border-slate-600/50 shadow-2xl">
                {/* Tech frame */}
                <div className="absolute inset-0 border-2 border-gray-400/30 rounded-3xl"></div>
                <div className="absolute inset-2 border border-slate-400/20 rounded-2xl"></div>

                <Image
                  src={productImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="160px"
                />

                {/* Corner accents */}
                <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-gray-400/60"></div>
                <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-gray-400/60"></div>
                <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-gray-400/60"></div>
                <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-gray-400/60"></div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-base text-white drop-shadow-lg line-clamp-2 leading-tight">
                {product.name}
              </p>

              {/* Enhanced swipe hint with tech styling */}
              <div className="mt-6 flex items-center justify-center gap-3 text-slate-300">
                <div className="flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4 animate-pulse text-gray-400" />
                  <div className="w-6 h-px bg-linear-to-r from-transparent to-gray-400/60"></div>
                </div>
                <span className="text-xs font-medium uppercase tracking-wide">
                  Swipe to Unlock
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-px bg-linear-to-l from-transparent to-gray-400/60"></div>
                  <ArrowRight className="h-4 w-4 animate-pulse text-gray-400" />
                </div>
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
