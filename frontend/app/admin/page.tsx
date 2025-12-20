// Admin overview dashboard page.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  TrendingUp,
  Package,
} from "lucide-react";
import { adminDashboardApi } from "@/features/admin/api/dashboard";
import type {
  AdminStats,
  SalesData,
  TopProduct,
  LowStockProduct,
} from "@/features/admin/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [statsData, salesDataResult, topProductsData, lowStockData] =
          await Promise.all([
            adminDashboardApi.getStats(),
            adminDashboardApi.getSalesData(30),
            adminDashboardApi.getTopProducts(5),
            adminDashboardApi.getLowStockProducts(),
          ]);

        setStats(statsData);
        setSalesData(salesDataResult);
        setTopProducts(topProductsData);
        setLowStockProducts(lowStockData);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load dashboard data. Please try again.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner variant="full" />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Error Loading Dashboard
          </h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Sales",
      value: `$${(stats.totalSales ?? 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+12.5%",
      changeType: "positive" as const,
    },
    {
      title: "Total Orders",
      value: (stats.totalOrders ?? 0).toLocaleString(),
      icon: ShoppingBag,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+8.2%",
      changeType: "positive" as const,
    },
    {
      title: "Customers",
      value: (stats.totalCustomers ?? 0).toLocaleString(),
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+15.3%",
      changeType: "positive" as const,
    },
    {
      title: "Low Stock Items",
      value: (stats.lowStockItems ?? 0).toString(),
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: null,
      changeType: null,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome back! Here's what's happening with your store.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/products/new">
                <Button>Add Product</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8 lg:ml-0">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      {card.title}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {card.value}
                    </p>
                    {card.change && (
                      <div className="mt-2 flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">
                          {card.change}
                        </span>
                        <span className="text-sm text-gray-500">
                          vs last month
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bgColor}`}
                  >
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts and Tables Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Sales Chart Placeholder */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Sales Overview (Last 30 Days)
            </h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm">
                Chart will be implemented after
              </p>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Top Products
              </h2>
              <Link href="/admin/products">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.sales} sales • $
                        {(product.revenue ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No products found
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {lowStockProducts.length > 0 && (
          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Low Stock Alerts
                </h2>
              </div>
              <Link href="/admin/products?filter=low-stock">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-orange-200 bg-orange-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                    <Package className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-orange-600 font-medium">
                      Only {product.stock} left
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Link href="/admin/products/new">
              <Button variant="outline" className="w-full justify-start">
                <Package className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </Link>
            <Link href="/admin/categories/new">
              <Button variant="outline" className="w-full justify-start">
                <Package className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="outline" className="w-full justify-start">
                <ShoppingBag className="mr-2 h-4 w-4" />
                View Orders
              </Button>
            </Link>
            <Link href="/admin/carousels">
              <Button variant="outline" className="w-full justify-start">
                <Package className="mr-2 h-4 w-4" />
                Manage Carousels
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
