// Order complete page - shows thank you message and order details
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ordersApi } from "@/features/orders/api";
import { formatPrice } from "@/lib/utils";
import type { BackendOrderResponseDto } from "@/features/orders/api";

const steps = [
  { label: "Shopping Cart", active: false, completed: true },
  { label: "Checkout Details", active: false, completed: true },
  { label: "Order Complete", active: true, completed: false },
];

export default function OrderCompletePage() {
  const params = useParams();
  const orderIdParam = params?.orderId;
  const orderId = Array.isArray(orderIdParam) ? orderIdParam[0] : orderIdParam;

  // Fetch order by id (token is in httpOnly cookie, automatically sent by browser)
  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useQuery<BackendOrderResponseDto>({
    queryKey: ["order", orderId],
    queryFn: () => ordersApi.getOrderByIdRaw(orderId!),
    enabled: !!orderId,
    retry: false, // Don't retry on error for better UX
  });

  if (!orderId) {
    return (
      <main className="flex-1 bg-white py-8">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
              <p className="text-lg font-semibold text-gray-800">
                Order not found
              </p>
              <div className="mt-5">
                <Link href="/products">
                  <Button className="rounded-full px-6">
                    Continue shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex-1 bg-white py-8">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <LoadingSpinner />
          </div>
        </main>
    );
  }

  if (isError || !order) {
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
      <main className="flex-1 bg-white py-8">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
              <p className="text-lg font-semibold text-gray-800">
                {errorMessage}
              </p>
              {process.env.NODE_ENV === "development" && error && (
                <p className="mt-2 text-sm text-gray-600">
                  Order ID: {orderId}
                </p>
              )}
              <div className="mt-5">
                <Link href="/products">
                  <Button className="rounded-full px-6">
                    Continue shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
    );
  }

  return (
    <main className="flex-1 bg-white py-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Steps: hide on mobile for cleaner layout */}
          <div className="mb-6 hidden flex-wrap items-center justify-center gap-3 text-sm font-semibold text-gray-700 text-center sm:flex">
            {steps.map((step, idx) => {
              const stepUrls = ["/cart", "/checkout", ""];
              const stepUrl = stepUrls[idx];
              const isClickable = stepUrl && idx < 2; // Only first 2 steps are clickable

              const stepContent = (
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                      step.active
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : step.completed
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-300 bg-white text-gray-600"
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <span
                    className={`transition-colors ${
                      step.active
                        ? "text-primary-700"
                        : step.completed
                        ? "text-emerald-700"
                        : "text-gray-600"
                    }`}
                  >
                    {step.label}
                  </span>
                  {idx < steps.length - 1 && (
                    <span className="mx-2 text-gray-300">—</span>
                  )}
                </div>
              );

              return isClickable ? (
                <Link
                  key={step.label}
                  href={stepUrl}
                  className="hover:opacity-80 transition-opacity"
                >
                  {stepContent}
                </Link>
              ) : (
                <div key={step.label}>{stepContent}</div>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            {/* Thank You Section */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              {/* Success Icon */}
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-emerald-100 p-4">
                  <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                </div>
              </div>

              {/* Thank You Message */}
              <h1 className="mb-4 text-center text-3xl font-bold text-gray-900">
                Thank you for your order!
              </h1>
              <p className="mb-6 text-center text-lg text-gray-600">
                Your order has been received and is being processed.
              </p>

              {/* Order Number */}
              <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                <p className="mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Order Number
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {order.orderNumber}
                </p>
              </div>

              {/* Continue Shopping Button */}
              <div className="mt-6">
                <Link href="/products">
                  <Button className="w-full rounded-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-base font-semibold uppercase text-gray-800">
                Your order
              </h2>
              <div className="mt-4 space-y-3 text-sm text-gray-700">
                <div className="flex items-center justify-between font-semibold text-gray-900">
                  <span>Product</span>
                  <span>Subtotal</span>
                </div>
                {order.items && order.items.length > 0 ? (
                  <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-3 py-2 text-sm"
                      >
                        <span className="text-gray-800">
                          {item.title} × {item.quantity}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatPrice(item.total, {
                            alwaysShowDecimals: true,
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-gray-200 p-4 text-center text-sm text-gray-600">
                    No items available
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 text-sm font-semibold text-gray-900">
                  <span>Subtotal</span>
                  <span>
                    {formatPrice(order.subtotal, { alwaysShowDecimals: true })}
                  </span>
                </div>

                {order.shipping > 0 && (
                  <div className="flex items-center justify-between text-sm text-gray-700">
                    <span>Shipping</span>
                    <span className="font-semibold">
                      {formatPrice(order.shipping, {
                        alwaysShowDecimals: true,
                      })}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span>
                    {formatPrice(order.total, { alwaysShowDecimals: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
