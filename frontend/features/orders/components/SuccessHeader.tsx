import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stack } from "@/components/ui/stack";
import { Heading, Text } from "@/components/ui/typography";
import type { BackendOrderResponseDto } from "../api";

interface SuccessHeaderProps {
  order: BackendOrderResponseDto;
  isDemo: boolean;
}

export function SuccessHeader({ order, isDemo }: SuccessHeaderProps) {
  // Handle missing order number gracefully
  const displayOrderNumber =
    order.orderNumber || `Order #${order.id.slice(-8)}`;

  return (
    <Card className="p-8 text-center">
      <Stack spacing="lg" align="center">
        {/* Success Icon */}
        <div className="rounded-full bg-primary-100 p-4">
          <CheckCircle2 className="h-12 w-12 text-primary-600" />
        </div>

        {/* Thank You Message */}
        <Stack spacing="sm" align="center">
          <Heading level="h1">Thank you for your order!</Heading>
          <Text className="max-w-md">
            Your order has been received and is being processed.
          </Text>
        </Stack>

        {/* Demo Mode Badge */}
        {isDemo && (
          <Badge variant="secondary" className="text-xs">
            Demo Mode
          </Badge>
        )}

        {/* Order Number */}
        <Card className="bg-gray-50 px-6 py-4 text-center">
          <Text
            variant="meta"
            className="font-medium text-gray-600 uppercase tracking-wide"
          >
            Order Number
          </Text>
          <Text className="mt-1 text-xl font-bold text-gray-900">
            {displayOrderNumber}
          </Text>
        </Card>

        {/* Continue Shopping Button */}
        <div className="pt-4">
          <Link href="/products">
            <button className="rounded-lg bg-red-600 px-8 py-3 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-red-700 shadow-xl hover:scale-105 active:scale-95">
              Continue Shopping
            </button>
          </Link>
        </div>
      </Stack>
    </Card>
  );
}
