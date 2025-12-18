// Profile overview with quick stats.
"use client";

import { toast } from "sonner";
import { useOrderStatsQuery } from "@/lib/queries/orders";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Package, DollarSign, Clock, CheckCircle } from "lucide-react";

export function ProfileDashboard() {
  // React Query hook - automatically cached and deduplicated
  const { data: stats, isLoading, error } = useOrderStatsQuery();

  // Show error toast if query fails
  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load dashboard stats";
    toast.error(errorMessage);
  }

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
        Failed to load dashboard stats. Please try again.
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Total Spent",
      value: `$${stats?.totalSpent.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      title: "Completed Orders",
      value: stats?.completedOrders || 0,
      icon: CheckCircle,
      color: "bg-primary-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {card.title}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {card.value}
                  </p>
                </div>
                <div className={`rounded-full ${card.color} p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Welcome to Your Dashboard
        </h2>
        <p className="text-gray-600">
          Here you can view your order statistics, manage your addresses, and
          update your account information. Use the tabs above to navigate
          between different sections.
        </p>
      </div>
    </div>
  );
}
