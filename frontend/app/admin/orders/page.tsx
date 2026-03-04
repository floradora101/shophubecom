"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  MoreHorizontal,
  ChevronDown,
  ArrowUpDown,
  ShoppingCart,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Loader2,
  AlertCircle,
  Filter,
  Eye
} from "lucide-react";
import { Heading, Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/cn";
import { format } from "date-fns";
import { useAdminOrdersQuery, useUpdateOrderStatusMutation } from "@/features/orders/queries";
import type { OrderStatus } from "@/features/orders/api";

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useAdminOrdersQuery({
    page,
    limit,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    search: search || undefined,
  });

  const updateStatusMutation = useUpdateOrderStatusMutation();

  const handleStatusUpdate = async (id: string, status: OrderStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
    } catch (err) {
      // Error handled in mutation
    }
  };

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

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Heading level="h2">Orders Management</Heading>
          <Text className="text-warm-gray-500">
            Monitor and update order status across all customers.
          </Text>
        </div>
      </div>

      <Card className="border-warm-gray-200 shadow-sm overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="p-4 border-b border-warm-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-warm-gray-50/30">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray-400" />
              <Input
                placeholder="Search by order # or customer..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10 bg-white border-warm-gray-200 focus:ring-primary-500 rounded-lg h-10"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-lg border-warm-gray-200 bg-white h-10 px-4 min-w-[160px] justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-warm-gray-400" />
                    <span className="text-sm font-medium text-warm-gray-700">
                      {statusFilter === "ALL" ? "All Statuses" : statusFilter}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-lg p-2 shadow-2xl border-warm-gray-100">
                <DropdownMenuLabel className="text-[10px] font-bold text-warm-gray-400 uppercase px-2 py-2">Filter Status</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-warm-gray-100" />
                <DropdownMenuRadioGroup value={statusFilter} onValueChange={(v) => {
                  setStatusFilter(v as any);
                  setPage(1);
                }}>
                  <DropdownMenuRadioItem value="ALL" className="rounded-lg cursor-pointer py-2.5">All Statuses</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="PENDING" className="rounded-lg cursor-pointer py-2.5">Pending</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="PROCESSING" className="rounded-lg cursor-pointer py-2.5">Processing</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="SHIPPED" className="rounded-lg cursor-pointer py-2.5">Shipped</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="DELIVERED" className="rounded-lg cursor-pointer py-2.5">Delivered</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="CANCELLED" className="rounded-lg cursor-pointer py-2.5 text-red-600">Cancelled</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-warm-gray-400 font-medium hidden md:block">
              {data?.total ?? 0} orders found
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[400px] bg-white">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              <Text className="text-warm-gray-500 font-medium">Loading orders...</Text>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <Heading level="h3">Failed to load orders</Heading>
              <Text className="text-warm-gray-500">
                {error instanceof Error ? error.message : "An error occurred while fetching orders."}
              </Text>
              <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
            </div>
          ) : data?.data.length === 0 ? (
            <div className="py-32 text-center">
              <ShoppingCart className="w-16 h-16 text-warm-gray-100 mx-auto mb-4" />
              <Text className="text-warm-gray-500 font-medium text-lg">No orders found</Text>
              <Text className="text-warm-gray-400 text-sm mt-1">Try adjusting your filters.</Text>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-warm-gray-50/50 border-b border-warm-gray-100">
                    <th className="py-3 px-6 text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider">Order Info</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider text-center">Items</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider text-right">Total</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider text-center">Status</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-gray-100">
                  {data?.data.map((order) => (
                    <tr key={order.id} className="hover:bg-warm-gray-50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <Text className="font-bold text-warm-gray-900 text-sm">#{order.orderNumber}</Text>
                          <Text className="text-[10px] text-warm-gray-400 font-medium uppercase tracking-tight">
                            {format(new Date(order.placedAt), "MMM d, yyyy · HH:mm")}
                          </Text>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <Text className="text-sm font-semibold text-warm-gray-900">
                            {order.user?.fullName || order.shippingAddress.fullName || "Guest Customer"}
                          </Text>
                          <Text className="text-xs text-warm-gray-400">{order.user?.email || "No email"}</Text>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Badge variant="outline" className="bg-warm-gray-50 text-warm-gray-600 border-warm-gray-200">
                          {order.items.length} items
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Text className="font-bold text-warm-gray-900 text-sm">
                          ${order.total.toFixed(2)}
                        </Text>
                        <Text className="text-[9px] text-warm-gray-400 font-bold uppercase">{order.currency}</Text>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center">
                          <Badge className={cn("rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide gap-1.5 border shadow-sm", statusColors[order.status])}>
                            {statusIcons[order.status]}
                            {order.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-warm-gray-100">
                              <MoreHorizontal className="h-4 w-4 text-warm-gray-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-lg p-2 shadow-2xl border-warm-gray-100">
                            <DropdownMenuLabel className="text-[10px] font-bold text-warm-gray-400 uppercase px-2 py-1.5">Manage Order</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/orders/${order.id}`} className="rounded-lg cursor-pointer flex items-center gap-2 px-3 py-2.5">
                                <Eye className="w-4 h-4 text-warm-gray-400" />
                                <span className="text-sm">View Details</span>
                              </Link>
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="bg-warm-gray-100" />
                            <DropdownMenuLabel className="text-[10px] font-bold text-warm-gray-400 uppercase px-2 py-1.5">Update Status</DropdownMenuLabel>
                            
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(order.id, "PROCESSING")}
                              disabled={order.status === "PROCESSING"}
                              className="rounded-lg cursor-pointer px-3 py-2"
                            >
                              Mark as Processing
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(order.id, "SHIPPED")}
                              disabled={order.status === "SHIPPED"}
                              className="rounded-lg cursor-pointer px-3 py-2"
                            >
                              Mark as Shipped
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(order.id, "DELIVERED")}
                              disabled={order.status === "DELIVERED"}
                              className="rounded-lg cursor-pointer px-3 py-2"
                            >
                              Mark as Delivered
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-warm-gray-100" />
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(order.id, "CANCELLED")}
                              disabled={order.status === "CANCELLED"}
                              className="rounded-lg cursor-pointer px-3 py-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              Cancel Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t border-warm-gray-100 flex items-center justify-between bg-warm-gray-50/30">
            <Text className="text-xs text-warm-gray-500">
              Showing page <span className="font-bold text-warm-gray-900">{page}</span> of <span className="font-bold text-warm-gray-900">{data.totalPages}</span>
            </Text>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="rounded-lg"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
