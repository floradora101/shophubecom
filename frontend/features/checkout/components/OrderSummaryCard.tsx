// Professional order summary card component for checkout and order details
import { LoadingButton } from "@/components/ui/loading-button";
import { Card } from "@/components/ui/card";
import { ProductImage } from "@/components/ui/product-image";
import { Price } from "@/components/ui/price";
import { Badge } from "@/components/ui/badge";
import { Heading, Text } from "@/components/ui/typography";
import { CouponCodeInput } from "@/features/checkout/components/CouponCodeInput";
import { useCart } from "@/features/cart/hooks";
import { cn } from "@/lib/utils/cn";
import { ShoppingBag, Truck, Package, ShieldCheck } from "lucide-react";

interface OrderSummaryCardProps {
  shippingOption: "pickup" | "beirut" | "outside";
  isSubmitting?: boolean;
  showCTA?: boolean;
  className?: string;
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
    <Card
      className={cn(
        "shadow-xl shadow-warm-gray-100/50 border-warm-gray-200",
        className
      )}
    >
      <div className="p-6 sm:p-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Heading
            level="h4"
            className="uppercase tracking-widest text-sm font-black"
          >
            Order Summary
          </Heading>
          <Text variant="meta" className="text-warm-gray-600 font-medium">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </Text>
        </div>

        {/* Products Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-warm-gray-100">
            <ShoppingBag className="h-4 w-4 text-primary-600" />
            <Text
              variant="meta"
              className="font-bold text-warm-gray-900 uppercase tracking-widest text-[10px]"
            >
              Products
            </Text>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-xl bg-warm-gray-50/50 transition-all hover:bg-white hover:shadow-sm border border-transparent hover:border-warm-gray-100"
              >
                {/* Product Image */}
                <div className="shrink-0">
                  <ProductImage
                    src={item.image || "/placeholder-product.jpg"}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg border border-warm-gray-100 p-1 bg-white"
                    aspectRatio="square"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <Text className="font-bold text-fg line-clamp-2 text-sm">
                        {item.name}
                      </Text>
                      {item.selectedOptions && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {Object.entries(item.selectedOptions).map(
                            ([key, value]) => (
                              <Badge
                                key={key}
                                variant="secondary"
                                size="sm"
                                className="bg-white border-warm-gray-200 text-[9px] tracking-normal font-medium lowercase"
                              >
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
                      className="font-black text-fg shrink-0"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Text
                      variant="meta"
                      className="text-warm-gray-600 font-bold text-[10px] uppercase tracking-widest"
                    >
                      Qty: {item.quantity}
                    </Text>
                    <Text
                      variant="meta"
                      className="text-warm-gray-400 font-medium italic"
                    >
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
            <Package className="h-4 w-4 text-primary-600" />
            <Text
              variant="meta"
              className="font-bold text-warm-gray-900 uppercase tracking-widest text-[10px]"
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
            <Truck className="h-4 w-4 text-primary-600" />
            <Text
              variant="meta"
              className="font-bold text-warm-gray-900 uppercase tracking-widest text-[10px]"
            >
              Order Total
            </Text>
          </div>

          <div className="space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <Text variant="meta" className="text-warm-gray-600 font-medium">
                Subtotal
              </Text>
              <Price amount={subtotal} size="sm" className="font-bold" />
            </div>

            {/* Shipping */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showShippingIcon && (
                  <div className="w-6 h-6 rounded-full bg-warm-gray-100 flex items-center justify-center text-warm-gray-600">
                    {getShippingIcon()}
                  </div>
                )}
                <Text variant="meta" className="text-warm-gray-600 font-medium">
                  {getShippingLabel()}
                </Text>
              </div>
              <Text variant="meta" className="font-bold text-fg">
                {getShippingPrice()}
              </Text>
            </div>

            {/* Discount */}
            {couponDiscount > 0 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-100">
                <Text variant="meta" className="text-green-700 font-bold">
                  Discount ({couponCode})
                </Text>
                <Text variant="meta" className="font-black text-green-700">
                  -${couponDiscount.toFixed(2)}
                </Text>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="pt-6 border-t-2 border-dashed border-warm-gray-200">
            <div className="flex items-center justify-between">
              <Text className="font-black text-fg uppercase tracking-widest text-sm">
                Total
              </Text>
              <div className="text-right">
                <Price
                  amount={total}
                  size="lg"
                  className="font-black text-primary-600 text-2xl"
                />
                <Text
                  variant="meta"
                  className="text-[10px] uppercase tracking-widest font-bold text-warm-gray-400"
                >
                  Taxes included
                </Text>
              </div>
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
              className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold tracking-[0.05em] uppercase rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
              loading={isSubmitting}
              loadingText="Placing order..."
            >
              Place Order
            </LoadingButton>
            <div className="mt-6 p-4 rounded-2xl bg-primary-50/50 border border-primary-100 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-primary-700 leading-relaxed font-medium">
                Your payment information is processed securely. We do not store
                credit card details nor have access to your credit card
                information.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
