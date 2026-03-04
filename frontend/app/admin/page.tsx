"use client";

import React, { useMemo } from "react";
import { Heading, Text } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import {
  Layers,
  Package,
  TrendingUp,
  Users,
  ArrowUpRight,
  Clock,
  Loader2,
  AlertCircle,
  ShoppingCart,
  CheckCircle,
  Truck,
  AlertTriangle
} from "lucide-react";
import { useAdminStatsQuery, useRecentOrdersQuery, useTopProductsQuery } from "@/features/admin/queries";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useAdminStatsQuery();
  const { data: recentOrders, isLoading: ordersLoading } = useRecentOrdersQuery({ limit: 5 });
  const { data: topProducts, isLoading: productsLoading } = useTopProductsQuery({ limit: 5 });

  const summaryStats = useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        label: "Total Sales",
        value: `$${stats.totalSales.toLocaleString()}`,
        icon: TrendingUp,
        color: "bg-emerald-500",
        trend: "Total revenue generated"
      },
      {
        label: "Total Orders",
        value: stats.totalOrders.toLocaleString(),
        icon: ShoppingCart,
        color: "bg-blue-500",
        trend: `${stats.pendingOrders} pending orders`
      },
      {
        label: "Total Customers",
        value: stats.totalCustomers.toLocaleString(),
        icon: Users,
        color: "bg-amber-500",
        trend: "Registered customer base"
      },
      {
        label: "Low Stock Items",
        value: stats.lowStockItems.toLocaleString(),
        icon: AlertTriangle,
        color: stats.lowStockItems > 0 ? "bg-rose-500" : "bg-warm-gray-400",
        trend: "Items below threshold"
      }
    ];
  }, [stats]);

  const orderStatusColors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    PROCESSING: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-rose-100 text-rose-700",
  };

  if (statsLoading || ordersLoading || productsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <Text className="text-warm-gray-500 font-medium">Loading dashboard data...</Text>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <Heading level="h3">Failed to load dashboard</Heading>
        <Text className="text-warm-gray-500">
          {statsError instanceof Error ? statsError.message : "An error occurred while fetching dashboard statistics."}
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <Heading level="h2">Dashboard Overview</Heading>
        <Text className="text-warm-gray-500">
          Welcome back to your management console.
        </Text>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat) => (
          <Card key={stat.label} className="p-6 border-warm-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className={cn(stat.color, "p-3 rounded-xl text-white shadow-lg shadow-current/20")}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4">
              <Text className="text-sm font-medium text-warm-gray-500">{stat.label}</Text>
              <div className="flex items-baseline gap-2 mt-1">
                <Heading level="h3" className="text-2xl font-bold text-warm-gray-900">
                  {stat.value}
                </Heading>
              </div>
              <Text className="text-[10px] text-warm-gray-400 mt-2 font-medium italic">
                {stat.trend}
              </Text>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-warm-gray-200 shadow-sm overflow-hidden bg-white">
          <div className="p-4 border-b border-warm-gray-100 flex items-center justify-between bg-warm-gray-50/30">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              <Heading level="h4" className="text-sm font-bold uppercase tracking-wider text-warm-gray-700">Recent Orders</Heading>
            </div>
            <Link href="/admin/orders" className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-widest">View all</Link>
          </div>
          <div className="divide-y divide-warm-gray-100">
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-warm-gray-50/50 transition-colors">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-warm-gray-100 flex items-center justify-center shrink-0">
                      <ShoppingCart className="w-5 h-5 text-warm-gray-400" />
                    </div>
                    <div>
                      <Text className="text-sm font-bold text-warm-gray-900">Order #{order.orderNumber}</Text>
                      <Text className="text-xs text-warm-gray-500">{order.customer.name || "Guest Customer"}</Text>
                      <Text className="text-[10px] text-warm-gray-400 mt-0.5 uppercase font-bold tracking-tight">
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                      </Text>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <Text className="text-sm font-bold text-warm-gray-900">${order.totalAmount.toFixed(2)}</Text>
                    <Badge className={cn("text-[9px] px-2 py-0 h-4 border-none", orderStatusColors[order.status] || "bg-warm-gray-100")}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Text className="text-warm-gray-400 text-sm">No recent orders found</Text>
              </div>
            )}
          </div>
        </Card>

        <Card className="border-warm-gray-200 shadow-sm overflow-hidden bg-white">
          <div className="p-4 border-b border-warm-gray-100 flex items-center justify-between bg-warm-gray-50/30">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <Heading level="h4" className="text-sm font-bold uppercase tracking-wider text-warm-gray-700">Top Selling Products</Heading>
            </div>
            <Link href="/admin/products" className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-widest">Inventory</Link>
          </div>
          <div className="divide-y divide-warm-gray-100">
            {topProducts && topProducts.length > 0 ? (
              topProducts.map((product) => (
                <div key={product.id} className="p-4 flex items-center justify-between hover:bg-warm-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-warm-gray-100 bg-warm-gray-50">
                      {product.image ? (
                        <Image src={product.image} alt={product.name} fill className="object-cover" sizes="40px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-warm-gray-300">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <Text className="text-sm font-bold text-warm-gray-900 truncate max-w-[150px]">{product.name}</Text>
                      <Text className="text-[10px] text-warm-gray-400 uppercase font-bold">{product.sales} units sold</Text>
                    </div>
                  </div>
                  <div className="text-right">
                    <Text className="text-sm font-bold text-emerald-600">${product.revenue.toLocaleString()}</Text>
                    <Text className="text-[9px] text-warm-gray-400 uppercase font-bold">Revenue</Text>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Text className="text-warm-gray-400 text-sm">No sales data available</Text>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

