// Profile order history list.
"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useEffect } from "react";
import { useOrdersQuery } from "@/features/orders/queries";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { extractErrorMessage } from "@/lib/utils/error-handler";
import { formatPrice } from "@/lib/utils";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export function ProfileOrders() {
  // React Query hook - automatically cached and deduplicated
  const {
    data: ordersData,
    isLoading,
    error,
  } = useOrdersQuery({
    limit: 50, // Get more orders for profile page
  });

  // Extract data from query result
  const orders = ordersData?.data || [];

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast.error(extractErrorMessage(error, "Failed to load orders"));
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        Failed to load orders. Please try again.
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-600">You haven&apos;t placed any orders yet.</p>
        <Link
          href="/products"
          className="mt-4 inline-block text-primary-600 hover:text-primary-600 font-medium"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Order #{order.orderNumber}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  statusColors[order.status] || statusColors.PENDING
                }`}
              >
                {order.status}
              </span>
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(order.totalAmount, { alwaysShowDecimals: true })}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-2">
              {order.items.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 text-sm text-gray-600"
                >
                  <span className="font-medium">{item.quantity}x</span>
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="hover:text-primary-600 flex-1"
                  >
                    {item.productName}
                  </Link>
                  <span className="font-medium">
                    {formatPrice(item.price, { alwaysShowDecimals: true })}
                  </span>
                </div>
              ))}
              {order.items.length > 3 && (
                <p className="text-sm text-gray-500">
                  +{order.items.length - 3} more item(s)
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Shipping to:</span>{" "}
              {order.address.name}, {order.address.city}, {order.address.state}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
