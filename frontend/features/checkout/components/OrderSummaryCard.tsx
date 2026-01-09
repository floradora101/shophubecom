// Professional order summary card component for checkout and order details
import { LoadingButton } from "@/components/ui/loading-button";
import { Card } from "@/components/ui/card";
import { ProductImage } from "@/components/ui/product-image";
import { Price } from "@/components/ui/price";
import { Badge } from "@/components/ui/badge";
import { Heading, Text } from "@/components/ui/typography";
import { CouponCodeInput } from "@/features/checkout/components/CouponCodeInput";
import { useCart } from "@/features/cart/hooks";
import { formatPrice } from "@/lib/utils/price";
import { cn } from "@/lib/utils/cn";
import { ShoppingBag, Truck, Package } from "lucide-react";

interface OrderSummaryCardProps {
  shippingOption: "pickup" | "beirut" | "outside";
  isSubmitting?: boolean;
  showCTA?: boolean;
  className?: string;
  variant?: "default" | "compact";
  showShippingIcon?: boolean;
  // Coupon props
  couponCode?: string;
  couponDiscount?: number;
  couponError?: string;
  isValidatingCoupon?: boolean;
  onApplyCoupon?: (code: string) => Promise<void>;
  onRemoveCoupon?: () => void;
}

export function OrderSummaryCard({
  shippingOption,
  isSubmitting = false,
  showCTA = true,
  className,
  variant = "default",
  showShippingIcon = true,
  // Coupon props
  couponCode,
  couponDiscount = 0,
  couponError,
  isValidatingCoupon = false,
  onApplyCoupon,
  onRemoveCoupon,
}: OrderSummaryCardProps) {
  const { items, subtotal } = useCart();

  const shippingCost =
    shippingOption === "pickup" ? 0 : shippingOption === "beirut" ? 0 : 5;
  const total = subtotal + shippingCost - couponDiscount;

  const isEmpty = items.length === 0;

  const getShippingIcon = () => {
    switch (shippingOption) {
      case "pickup":
        return <Package className="h-4 w-4" />;
      case "beirut":
        return <Truck className="h-4 w-4" />;
      case "outside":
        return <Truck className="h-4 w-4" />;
      default:
        return <Truck className="h-4 w-4" />;
    }
  };

  const getShippingLabel = () => {
    switch (shippingOption) {
      case "pickup":
        return "Local pickup";
      case "beirut":
        return "Beirut delivery";
      case "outside":
        return "Outside Beirut";
      default:
        return "Shipping";
    }
  };

  const getShippingPrice = () => {
    switch (shippingOption) {
      case "pickup":
        return "Free";
      case "beirut":
        return "Free";
      case "outside":
        return "$5.00";
      default:
        return "$0.00";
    }
  };

  if (isEmpty) {
    return (
      <Card className={cn("border-dashed", className)}>
        <div className="p-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-warm-gray-100 rounded-full flex items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-warm-gray-400" />
          </div>
          <div className="space-y-2">
            <Heading level="h4" className="text-warm-gray-900">
              Your cart is empty
            </Heading>
            <Text variant="meta" className="text-warm-gray-600">
              Add some items to get started
            </Text>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-sm", className)}>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Heading level="h4" className="uppercase tracking-wide">
            Order Summary
          </Heading>
          <Text variant="meta" className="text-warm-gray-600">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </Text>
        </div>

        {/* Products Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-warm-gray-100">
            <ShoppingBag className="h-4 w-4 text-warm-gray-500" />
            <Text
              variant="meta"
              className="font-medium text-warm-gray-900 uppercase tracking-wide"
            >
              Products
            </Text>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-lg bg-warm-gray-50/50 transition-colors hover:bg-warm-gray-50"
              >
                {/* Product Image */}
                <div className="shrink-0">
                  <ProductImage
                    src={item.image || "/placeholder-product.jpg"}
                    alt={item.name}
                    className="w-16 h-16 rounded-md"
                    aspectRatio="square"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <Text className="font-medium text-warm-gray-900 line-clamp-2">
                        {item.name}
                      </Text>
                      {item.selectedOptions && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(item.selectedOptions).map(
                            ([key, value]) => (
                              <Badge key={key} variant="secondary">
                                {value}
                              </Badge>
                            )
                          )}
                        </div>
                      )}
                    </div>
                    <Price
                      amount={item.price * item.quantity}
                      size="sm"
                      className="font-semibold text-warm-gray-900 shrink-0"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Text variant="meta" className="text-warm-gray-600">
                      Qty: {item.quantity}
                    </Text>
                    <Text variant="meta" className="text-warm-gray-500">
                      ${item.price.toFixed(2)} each
                    </Text>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coupon Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-warm-gray-100">
            <Package className="h-4 w-4 text-warm-gray-500" />
            <Text
              variant="meta"
              className="font-medium text-warm-gray-900 uppercase tracking-wide"
            >
              Coupon Code
            </Text>
          </div>

          <CouponCodeInput
            value=""
            onApply={onApplyCoupon || (() => Promise.resolve())}
            onRemove={onRemoveCoupon || (() => {})}
            isApplied={!!couponCode}
            appliedCode={couponCode}
            discountAmount={couponDiscount}
            error={couponError}
            isValidating={isValidatingCoupon}
            disabled={isSubmitting}
          />
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-warm-gray-100">
            <Truck className="h-4 w-4 text-warm-gray-500" />
            <Text
              variant="meta"
              className="font-medium text-warm-gray-900 uppercase tracking-wide"
            >
              Order Total
            </Text>
          </div>

          <div className="space-y-3">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <Text variant="meta" className="text-warm-gray-600">
                Subtotal
              </Text>
              <Price amount={subtotal} size="sm" />
            </div>

            {/* Shipping */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showShippingIcon && getShippingIcon()}
                <Text variant="meta" className="text-warm-gray-600">
                  {getShippingLabel()}
                </Text>
              </div>
              <Text variant="meta" className="font-medium text-warm-gray-900">
                {getShippingPrice()}
              </Text>
            </div>

            {/* Discount */}
            {couponDiscount > 0 && (
              <div className="flex items-center justify-between">
                <Text variant="meta" className="text-green-600">
                  Discount ({couponCode})
                </Text>
                <Text variant="meta" className="font-medium text-green-600">
                  -${couponDiscount.toFixed(2)}
                </Text>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="pt-4 border-t border-warm-gray-200">
            <div className="flex items-center justify-between">
              <Text className="font-semibold text-warm-gray-900">Total</Text>
              <Price
                amount={total}
                size="lg"
                className="font-bold text-warm-gray-900"
              />
            </div>
          </div>
        </div>

        {/* CTA Button */}
        {showCTA && (
          <div className="pt-2">
            <LoadingButton
              type="submit"
              size="lg"
              variant="destructive"
              className="w-full rounded-full py-3 text-base font-semibold shadow-sm transition-all hover:shadow-md"
              loading={isSubmitting}
              loadingText="Placing order..."
            >
              Place Order
            </LoadingButton>
          </div>
        )}
      </div>
    </Card>
  );
}
