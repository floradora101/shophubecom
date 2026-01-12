import { memo } from "react";
import { Price } from "@/components/ui/price";
import type { Product } from "@/features/products/types";

interface HeroPriceBlockProps {
  product: Product;
  className?: string;
}

export const HeroPriceBlock = memo(function HeroPriceBlock({
  product,
  className,
}: HeroPriceBlockProps) {
  const pricing = {
    currentPrice: product.price,
    originalPrice: product.originalPrice,
    discountPercent: product.discountPercent,
    hasDiscount: Boolean(
      product.originalPrice && product.originalPrice > product.price
    ),
  };

  const { currentPrice, originalPrice, discountPercent, hasDiscount } = pricing;

  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${className || ""}`}>
      {/* Main Price Pill */}
      <div
        className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-black text-white shadow-xl transition-transform hover:scale-105 border border-white/20"
        style={{
          background: `linear-gradient(135deg, #fa0603 0%, rgba(250, 6, 3, 0.12) 100%)`,
          boxShadow: `
            0 4px 14px 0 rgba(0, 0, 0, 0.1),
            0 2px 4px 0 rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.2)
          `,
        }}
      >
        <span className="text-base sm:text-lg tabular-nums">
          <Price amount={currentPrice} />
        </span>
      </div>

      {/* Discount Elements */}
      {hasDiscount && (
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Strikethrough Original Price */}
          <div
            className="text-xs sm:text-sm font-medium tabular-nums relative"
            style={{ color: "#7a6b67" }}
          >
            <Price amount={originalPrice!} />
            <div
              className="absolute inset-0 top-1/2 transform -translate-y-0.5 rotate-12"
              style={{
                height: "1px",
                backgroundColor: "#7a6b67",
                opacity: 0.6,
              }}
            />
          </div>

          {/* Savings Badge */}
          {discountPercent && (
            <div
              className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-bold rounded-md border-2"
              style={{
                backgroundColor: "rgba(250, 6, 3, 0.12)",
                borderColor: "#fa0603",
                color: "#fa0603",
              }}
            >
              -{discountPercent}%
            </div>
          )}
        </div>
      )}
    </div>
  );
});
