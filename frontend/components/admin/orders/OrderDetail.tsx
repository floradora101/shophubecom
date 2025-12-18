// Detailed admin view of a single order.
"use client";

import Image from "next/image";
import Link from "next/link";
import { Package, MapPin, User, Calendar, DollarSign } from "lucide-react";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderStatusUpdate } from "./OrderStatusUpdate";
import type { FullOrderDetail } from "@/lib/types/admin.types";

interface OrderDetailProps {
  order: FullOrderDetail;
  onStatusUpdate: (
    status: FullOrderDetail["status"],
    note?: string
  ) => Promise<void>;
  isUpdating?: boolean;
}

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='12' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

export function OrderDetail({
  order,
  onStatusUpdate,
  isUpdating = false,
}: OrderDetailProps) {
  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {order.orderNumber}
              </h1>
              <OrderStatusBadge status={order.status} size="lg" />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span className="font-semibold text-gray-900">
                  ${order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <OrderStatusUpdate
            currentStatus={order.status}
            onUpdate={onStatusUpdate}
            isUpdating={isUpdating}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Customer Information
            </h2>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>
              <span className="ml-2 font-medium text-gray-900">
                {order.customer.name}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Email:</span>
              <span className="ml-2 font-medium text-gray-900">
                {order.customer.email}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Customer ID:</span>
              <span className="ml-2 font-medium text-gray-900">
                {order.customer.id}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Shipping Address
            </h2>
          </div>
          <div className="space-y-1 text-sm">
            <div className="font-medium text-gray-900">
              {order.address.name}
            </div>
            <div className="text-gray-600">{order.address.street}</div>
            <div className="text-gray-600">
              {order.address.city}, {order.address.state}{" "}
              {order.address.zipCode}
            </div>
            <div className="text-gray-600">{order.address.phone}</div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Order Items ({order.items.length})
          </h2>
        </div>
        <div className="space-y-4">
          {order.items.map((item) => {
            const imageUrl = item.productImage || PLACEHOLDER_IMAGE;
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
              >
                <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={imageUrl}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized={imageUrl.startsWith("data:")}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.productSlug}`}
                    target="_blank"
                    className="text-sm font-medium text-gray-900 hover:text-primary-600"
                  >
                    {item.productName}
                  </Link>
                  <div className="text-xs text-gray-500 mt-1">
                    Product ID: {item.productId}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    ${item.price.toFixed(2)} × {item.quantity}
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
          <div className="text-right">
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="text-2xl font-bold text-gray-900">
              ${order.totalAmount.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Status History */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Status History
          </h2>
          <div className="space-y-3">
            {order.statusHistory
              .slice()
              .reverse()
              .map((history, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <OrderStatusBadge
                        status={history.status as FullOrderDetail["status"]}
                        size="sm"
                      />
                      <span className="text-xs text-gray-500">
                        {new Date(history.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {history.note && (
                      <p className="mt-1 text-sm text-gray-600">
                        {history.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
