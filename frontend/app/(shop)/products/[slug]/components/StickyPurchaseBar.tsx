// Sticky Purchase Bar Component
"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/features/products/types";

interface StickyPurchaseBarProps {
  show: boolean;
  product: Product;
  effectivePrice: number;
  hasDiscount: boolean;
  discountPercent: number;
  originalPrice?: number;
  canAddToCart: boolean;
  quantity: number;
  onQuantityChange: (value: number) => void;
  onAddToCart: () => void;
  isOutOfStock: boolean;
  isUnavailable: boolean;
  effectiveStock: number;
}

export function StickyPurchaseBar({
  show,
  product,
  effectivePrice,
  hasDiscount,
  discountPercent,
  originalPrice,
  canAddToCart,
  quantity,
  onQuantityChange,
  onAddToCart,
  isOutOfStock,
  isUnavailable,
  effectiveStock,
}: StickyPurchaseBarProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 sm:p-4 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto">
        {/* Product Title (mobile only) */}
        <div className="block sm:hidden mb-3">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <div className="font-bold text-gray-900 text-lg sm:text-base">
                {formatPrice(effectivePrice)}
              </div>
              {hasDiscount && originalPrice && (
                <span className="relative text-sm text-slate-400 font-medium px-1.5 py-0.5 rounded-sm bg-linear-to-r from-slate-100/50 to-transparent">
                  {formatPrice(originalPrice)}
                  {/* Modern diagonal strike-through */}
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-full h-px bg-linear-to-r from-transparent via-slate-400 to-transparent transform rotate-12 origin-center opacity-80"></span>
                  </span>
                </span>
              )}
              {hasDiscount && (
                <span className="text-sm font-medium text-red-600">
                  -{discountPercent}%
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => onQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="w-10 h-10 sm:w-8 sm:h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 active:scale-95 transition-all"
                aria-label="Decrease quantity"
              >
                <span className="text-lg font-medium">-</span>
              </button>
              <span className="w-10 sm:w-8 text-center font-medium text-sm sm:text-base">
                {quantity}
              </span>
              <button
                onClick={() => onQuantityChange(quantity + 1)}
                disabled={effectiveStock > 0 && quantity >= effectiveStock}
                className="w-10 h-10 sm:w-8 sm:h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 active:scale-95 transition-all"
                aria-label="Increase quantity"
              >
                <span className="text-lg font-medium">+</span>
              </button>
            </div>

            <Button
              onClick={canAddToCart ? onAddToCart : undefined}
              disabled={!canAddToCart}
              variant="destructive"
              className="h-12 sm:h-10 font-medium rounded-xl text-sm sm:text-sm flex-shrink-0 min-w-32 sm:min-w-0"
              size="default"
            >
              {isOutOfStock
                ? "Notify me"
                : isUnavailable
                ? "Not Available"
                : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
