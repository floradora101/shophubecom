// Status badge for order state.
"use client";

import type { AdminOrder } from "@/features/admin/types";

type OrderStatus = AdminOrder["status"];

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string }
> = {
  PENDING: {
    label: "Pending",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
  },
  PROCESSING: {
    label: "Processing",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  SHIPPED: {
    label: "Shipped",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
  },
  DELIVERED: {
    label: "Delivered",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

export function OrderStatusBadge({
  status,
  size = "md",
}: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.bgColor} ${config.color} ${sizeClasses[size]}`}
    >
      {config.label}
    </span>
  );
}
