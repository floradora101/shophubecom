// Profile overview with quick stats.
"use client";

import { toast } from "sonner";
import { useOrderStatsQuery, useOrdersQuery } from "@/features/orders/queries";
import { Package, DollarSign, Clock, CheckCircle, ShoppingBag } from "lucide-react";
import { extractErrorMessage } from "@/lib/utils/error-handler";
import { formatPrice } from "@/lib/utils";
import { useEffect } from "react";
import { Heading, Text } from "@/components/ui/typography";
import Link from "next/link";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function ProfileDashboard() {
  const { data: stats, isLoading, error } = useOrderStatsQuery();
  const { data: recentOrdersData } = useOrdersQuery({ page: 1, limit: 3 });

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast.error(
        extractErrorMessage(
          error,
          "Failed to load your order statistics. Please try again."
        )
      );
    }
  }, [error]);

  if (isLoading && !stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 mb-8 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-3xl" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: Package,
      gradient: "from-blue-500/10 to-blue-600/5",
      iconColor: "text-blue-600",
      description: "Lifetime purchases",
    },
    {
      title: "Total Spent",
      value: formatPrice(stats?.totalSpent || 0, { alwaysShowDecimals: true }),
      icon: DollarSign,
      gradient: "from-emerald-500/10 to-emerald-600/5",
      iconColor: "text-emerald-600",
      description: "Total investment",
    },
    {
      title: "Active Orders",
      value: stats?.pendingOrders || 0,
      icon: Clock,
      gradient: "from-amber-500/10 to-amber-600/5",
      iconColor: "text-amber-600",
      description: "In progress",
    },
    {
      title: "Success Rate",
      value: "100%",
      icon: CheckCircle,
      gradient: "from-primary-500/10 to-primary-600/5",
      iconColor: "text-primary-600",
      description: "Delivered items",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats Grid - More compact for 2-column layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/40 p-6 transition-all duration-500 hover:shadow-lg backdrop-blur-sm"
            >
              <div className="relative flex items-center gap-5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.gradient.replace(
                    "to-",
                    "bg-"
                  )} bg-opacity-20 shadow-sm group-hover:scale-110 transition-transform duration-500`}
                >
                  <Icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>

                <div className="space-y-0.5">
                  <Text
                    variant="meta"
                    className="font-black text-muted-fg/40 uppercase tracking-[0.2em] text-[8px]"
                  >
                    {card.title}
                  </Text>
                  <p className="text-2xl font-black text-fg tracking-tighter group-hover:text-primary-600 transition-colors">
                    {card.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Recent Orders */}
        <div className="space-y-4">
          <div className="px-2 flex items-center justify-between">
            <Heading level="h4" className="text-lg tracking-tight font-black text-fg">
              Recent Orders
            </Heading>
            <Link
              href="/profile?tab=orders"
              className="text-[11px] font-bold text-primary-600 uppercase tracking-[0.2em]"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrdersData?.data?.length ? (
              recentOrdersData.data.map((order) => (
                <Link
                  key={order.id}
                  href="/profile?tab=orders"
                  className="flex items-center justify-between p-4 rounded-2xl border border-white/80 bg-white/40 hover:bg-white hover:border-primary-500/20 hover:shadow-md transition-all duration-500 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-fg">
                        Order #{order.orderNumber}
                      </p>
                      <p className="text-[10px] text-muted-fg font-medium">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-fg">
                      {formatPrice(order.totalAmount, { alwaysShowDecimals: true })}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-xs text-muted-fg px-2">
                No orders yet. Your future purchases will appear here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
