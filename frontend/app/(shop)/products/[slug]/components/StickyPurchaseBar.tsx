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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="font-semibold text-slate-900">
            {formatPrice(effectivePrice)}
            {hasDiscount && originalPrice && (
              <span className="ml-2 text-sm text-slate-500 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
          {hasDiscount && (
            <span className="text-sm font-medium text-red-600">
              -{discountPercent}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50"
            >
              -
            </button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <button
              onClick={() => onQuantityChange(quantity + 1)}
              disabled={effectiveStock > 0 && quantity >= effectiveStock}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50"
            >
              +
            </button>
          </div>

          <Button
            onClick={canAddToCart ? onAddToCart : undefined}
            disabled={!canAddToCart}
            className="h-10 px-6 font-medium rounded-xl"
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
  );
}
