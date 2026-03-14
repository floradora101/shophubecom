"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  User,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { AdminLoadingState } from "../../_components/AdminLoadingState";
import { Heading, Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/cn";
import { format } from "date-fns";
import { useAdminOrderDetailQuery, useUpdateOrderStatusMutation } from "@/features/orders/queries";
import { extractErrorMessage } from "@/lib/api/error-handler";
import type { OrderStatus } from "@/features/orders/api";
import { OrderSummaryCard } from "@/features/orders/components/OrderSummaryCard";

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  PROCESSING: "bg-blue-100 text-blue-700 border-blue-200",
  SHIPPED: "bg-purple-100 text-purple-700 border-purple-200",
  DELIVERED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
};

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  PENDING: <Clock className="w-3 h-3" />,
  PROCESSING: <Loader2 className="w-3 h-3 animate-spin" />,
  SHIPPED: <Truck className="w-3 h-3" />,
  DELIVERED: <CheckCircle2 className="w-3 h-3" />,
  CANCELLED: <XCircle className="w-3 h-3" />,
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;

  const { data: order, isLoading, error, refetch } = useAdminOrderDetailQuery(id);
  const updateStatusMutation = useUpdateOrderStatusMutation();

  const handleStatusUpdate = async (status: OrderStatus) => {
    if (!id) return;
    try {
      await updateStatusMutation.mutateAsync({ id, status });
    } catch {
      // Error handled in mutation
    }
  };

  if (!id) {
    return (
      <div className="space-y-8 pb-10">
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <Heading level="h3">Invalid order</Heading>
          <Text className="text-warm-gray-500 mt-2">No order ID provided.</Text>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/admin/orders">Back to Orders</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8 pb-10">
        <AdminLoadingState message="Loading order details..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-8 pb-10">
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <Heading level="h3">Failed to load order</Heading>
          <Text className="text-warm-gray-500 mt-2">
            {extractErrorMessage(error, "An error occurred while fetching the order.")}
          </Text>
          <div className="flex gap-3 justify-center mt-4">
            <Button onClick={() => refetch()} variant="outline">
              Retry
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/orders">Back to Orders</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const customerName = order.user?.fullName || order.shippingAddress?.fullName || "Guest Customer";
  const customerEmail = order.user?.email || "No email";

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link href="/admin/orders">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <Heading level="h2">Order #{order.orderNumber}</Heading>
            <Text className="text-warm-gray-500">
              Placed {format(new Date(order.placedAt), "MMM d, yyyy 'at' HH:mm")}
            </Text>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide gap-2 border shadow-sm",
              statusColors[order.status]
            )}
          >
            {statusIcons[order.status]}
            {order.status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-lg">
                Update Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-lg p-2 shadow-2xl border-warm-gray-100">
              <DropdownMenuLabel className="text-[10px] font-bold text-warm-gray-400 uppercase px-2 py-2">
                Change Status
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-warm-gray-100" />
              <DropdownMenuItem
                onClick={() => handleStatusUpdate("PROCESSING")}
                disabled={order.status === "PROCESSING"}
              >
                Mark as Processing
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate("SHIPPED")}
                disabled={order.status === "SHIPPED"}
              >
                Mark as Shipped
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate("DELIVERED")}
                disabled={order.status === "DELIVERED"}
              >
                Mark as Delivered
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-warm-gray-100" />
              <DropdownMenuItem
                onClick={() => handleStatusUpdate("CANCELLED")}
                disabled={order.status === "CANCELLED"}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                Cancel Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content - order items & summary */}
        <div className="lg:col-span-2 space-y-6">
          <OrderSummaryCard order={order} />
        </div>

        {/* Sidebar - customer & shipping */}
        <div className="space-y-6">
          {/* Customer info */}
          <Card className="p-6 border-warm-gray-200">
            <div className="flex items-center gap-2 pb-3 border-b border-warm-gray-100">
              <User className="w-4 h-4 text-warm-gray-500" />
              <Heading level="h4" className="uppercase tracking-wide text-warm-gray-700">
                Customer
              </Heading>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-warm-gray-400 mt-0.5 shrink-0" />
                <div>
                  <Text className="font-semibold text-warm-gray-900">{customerName}</Text>
                  <Text variant="meta" className="text-warm-gray-500">
                    {order.userId ? "Registered customer" : "Guest checkout"}
                  </Text>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-warm-gray-400 shrink-0" />
                <Text className="text-sm text-warm-gray-700">{customerEmail}</Text>
              </div>
              {order.shippingAddress?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-warm-gray-400 shrink-0" />
                  <Text className="text-sm text-warm-gray-700">{order.shippingAddress.phone}</Text>
                </div>
              )}
            </div>
          </Card>

          {/* Shipping address */}
          {order.shippingAddress && (
            <Card className="p-6 border-warm-gray-200">
              <div className="flex items-center gap-2 pb-3 border-b border-warm-gray-100">
                <MapPin className="w-4 h-4 text-warm-gray-500" />
                <Heading level="h4" className="uppercase tracking-wide text-warm-gray-700">
                  Shipping Address
                </Heading>
              </div>
              <div className="mt-4 text-sm text-warm-gray-700 space-y-1">
                <Text className="font-medium">{order.shippingAddress.fullName}</Text>
                <Text>{order.shippingAddress.street1}</Text>
                {order.shippingAddress.street2 && <Text>{order.shippingAddress.street2}</Text>}
                <Text>
                  {order.shippingAddress.city}
                  {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}{" "}
                  {order.shippingAddress.postalCode}
                </Text>
                <Text>{order.shippingAddress.country}</Text>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
