import { Card } from "@/components/ui/card";
import { FormSection } from "@/components/ui/form-section";
import { ProductImage } from "@/components/ui/product-image";
import { Price } from "@/components/ui/price";
import { Badge } from "@/components/ui/badge";
import { Stack } from "@/components/ui/stack";
import { Heading, Text } from "@/components/ui/typography";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Truck } from "lucide-react";
import type { BackendOrderResponseDto } from "../api";

interface OrderSummaryCardProps {
  order: BackendOrderResponseDto;
}

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  const hasItems = order.items && order.items.length > 0;

  return (
    <Card className="p-6">
      <Stack spacing="lg">
        {/* Header */}
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <ShoppingBag className="h-4 w-4 text-gray-500" />
          <Heading level="h4" className="uppercase tracking-wide">
            Your order
          </Heading>
        </div>

        {/* Products Section */}
        {hasItems ? (
          <div className="space-y-4">
            <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-3 py-3 text-sm"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Product Image */}
                    <div className="shrink-0">
                      <ProductImage
                        src={
                          item.variant?.image ||
                          item.product?.images?.[0] ||
                          "/placeholder-product.jpg"
                        }
                        alt={item.title}
                        className="w-12 h-12 rounded-md"
                        aspectRatio="square"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="min-w-0 flex-1">
                      <Text className="font-medium text-gray-900 line-clamp-2">
                        {item.title}
                      </Text>

                      {/* Variant Options */}
                      {item.variant?.options && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.variant.options.map((option, index) => (
                            <Badge key={index} variant="secondary" size="sm">
                              {option.value}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Quantity */}
                      <Text variant="meta" className="text-gray-500 mt-1">
                        Qty: {item.quantity}
                      </Text>
                    </div>
                  </div>

                  {/* Price */}
                  <Price
                    amount={item.total}
                    size="sm"
                    className="font-semibold text-gray-900 shrink-0 ml-3"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 p-6 text-center">
            <Text className="text-gray-600">No items available</Text>
          </div>
        )}

        {/* Pricing Breakdown */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-sm">
            <Text className="text-gray-600">Subtotal</Text>
            <Price amount={order.subtotal} size="sm" />
          </div>

          {/* Shipping - Always show */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-gray-500" />
              <Text className="text-gray-600">
                {order.shipping > 0 ? "Shipping" : "Shipping (Free)"}
              </Text>
            </div>
            <Text className="font-medium text-gray-900">
              {order.shipping > 0
                ? formatPrice(order.shipping, { alwaysShowDecimals: true })
                : "Free"}
            </Text>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <Text className="font-semibold text-gray-900">Total</Text>
            <Price
              amount={order.total}
              size="lg"
              className="font-bold text-gray-900"
            />
          </div>
        </div>
      </Stack>
    </Card>
  );
}
