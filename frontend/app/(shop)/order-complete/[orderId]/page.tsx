// Order complete page - shows thank you message and order details
"use client";

import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { Stack } from "@/components/ui/stack";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Stepper } from "@/components/ui/stepper";
import { Heading, Text } from "@/components/ui/typography";
import { ordersApi } from "@/features/orders/api";
import { DEMO_CHECKOUT } from "@/lib/flags";
import { logger } from "@/lib/logger";
import { getDemoOrder } from "@/features/orders/demo/demoOrders";
import { SuccessHeader } from "@/features/orders/components/SuccessHeader";
import { OrderSummaryCard } from "@/features/orders/components/OrderSummaryCard";
import type { BackendOrderResponseDto } from "@/features/orders/api";

const steps = [
  { label: "Shopping Cart", href: "/cart", state: "done" as const },
  { label: "Checkout Details", href: "/checkout", state: "done" as const },
  { label: "Order Complete", state: "done" as const },
];

export default function OrderCompletePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const isDemo = DEMO_CHECKOUT || searchParams?.get("demo") === "1";
  const orderIdParam = params?.orderId;
  const orderId = Array.isArray(orderIdParam) ? orderIdParam[0] : orderIdParam;

  // Dev-only debug log for demo mode
  logger.debug(
    "OrderCompletePage - DEMO_CHECKOUT:",
    DEMO_CHECKOUT,
    "isDemo:",
    isDemo
  );

  // For demo mode, load demo order immediately
  const demoOrder = isDemo ? getDemoOrder(orderId!) : null;

  // Fetch order by id (token is in httpOnly cookie, automatically sent by browser)
  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useQuery<BackendOrderResponseDto>({
    queryKey: ["order", orderId],
    queryFn: () => ordersApi.getOrderByIdRaw(orderId!),
    enabled: !!orderId && !isDemo,
    retry: false, // Don't retry on error for better UX
  });

  // Use demo order if in demo mode, otherwise use backend order (or fallback to demo if backend fails)
  const finalOrder =
    demoOrder || order || (isError ? getDemoOrder(orderId!) : null);

  if (!orderId) {
    return (
      <Section spacing="lg">
        <Container size="lg">
          <Card className="p-12 text-center">
            <Stack spacing="md" align="center">
              <Heading level="h3">Order not found</Heading>
              <Text>Unable to locate the requested order.</Text>
              <div className="pt-4">
                <Link href="/products">
                  <button className="rounded-full bg-red-600 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700">
                    Continue shopping
                  </button>
                </Link>
              </div>
            </Stack>
          </Card>
        </Container>
      </Section>
    );
  }

  if (isLoading) {
    return (
      <Section spacing="lg">
        <Container size="lg">
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        </Container>
      </Section>
    );
  }

  if ((isError && !demoOrder) || (!order && !demoOrder)) {
    // Extract error message for better debugging
    let errorMessage = "Order not found";
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { data?: { message?: string }; status?: number };
      };
      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else if (axiosError.response?.status === 403) {
        errorMessage =
          "Access denied. Invalid token or insufficient permissions.";
      } else if (axiosError.response?.status === 404) {
        errorMessage = "Order not found. Please check your order ID.";
      }
    }

    return (
      <Section spacing="lg">
        <Container size="lg">
          <Card className="p-12 text-center">
            <Stack spacing="md" align="center">
              <Heading level="h3">{errorMessage}</Heading>
              {process.env.NODE_ENV === "development" && error && (
                <Text variant="meta" className="text-muted-fg">
                  Order ID: {orderId}
                </Text>
              )}
              <div className="pt-4">
                <Link href="/products">
                  <button className="rounded-full bg-red-600 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700">
                    Continue shopping
                  </button>
                </Link>
              </div>
            </Stack>
          </Card>
        </Container>
      </Section>
    );
  }

  if (!finalOrder) {
    return (
      <Section spacing="lg">
        <Container size="lg">
          <Card className="p-12 text-center">
            <Stack spacing="md" align="center">
              <Heading level="h3">Order not found</Heading>
              <Text>The requested order could not be located.</Text>
              <div className="pt-4">
                <Link href="/products">
                  <button className="rounded-full bg-red-600 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700">
                    Continue shopping
                  </button>
                </Link>
              </div>
            </Stack>
          </Card>
        </Container>
      </Section>
    );
  }

  return (
    <Section spacing="lg">
      <Container size="lg">
        <Stack spacing="xl" align="stretch">
          {/* Header */}
          <div className="text-center space-y-2">
            <Heading level="h2">Order Confirmation</Heading>
            <Text className="text-muted-fg max-w-md mx-auto">
              Your order has been successfully placed
            </Text>
          </div>

          {/* Stepper - hidden on mobile for cleaner layout */}
          {/* Stepper - hidden on mobile for cleaner layout */}
          <div className="hidden sm:block">
            <Stepper steps={steps} />
          </div>

          {/* Main Content */}
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            {/* Success Header */}
            <SuccessHeader order={finalOrder} isDemo={isDemo} />

            {/* Order Summary - sticky on desktop */}
            <div className="lg:sticky lg:top-6 h-fit">
              <OrderSummaryCard order={finalOrder} />
            </div>
          </div>
        </Stack>
      </Container>
    </Section>
  );
}
