// Profile overview with quick stats.
"use client";

import { toast } from "sonner";
import { useOrderStatsQuery } from "@/features/orders/queries";
import { LoadingSpinner } from "@/components/ui/spinner";
import {
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Heart,
  ArrowRight,
  User,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { extractErrorMessage } from "@/lib/utils/error-handler";
import { formatPrice } from "@/lib/utils";
import { useEffect, useMemo } from "react";
import { Heading, Text } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Mock stats for high-quality preview when backend is not available or during design phase
const mockStats = {
  totalOrders: 12,
  totalSpent: 1250.5,
  pendingOrders: 1,
  completedOrders: 11,
  recentActivity: [
    {
      id: 1,
      type: "order",
      title: "Order #SH-99281",
      status: "Delivered",
      date: "2 days ago",
      amount: "$129.99",
    },
    {
      id: 2,
      type: "order",
      title: "Order #SH-99102",
      status: "Processing",
      date: "Today",
      amount: "$45.00",
    },
    {
      id: 3,
      type: "review",
      title: "Reviewed iPhone 15 Pro",
      status: "Published",
      date: "5 days ago",
      amount: null,
    },
  ],
};

export function ProfileDashboard() {
  // React Query hook - automatically cached and deduplicated
  const { data: realStats, isLoading, error } = useOrderStatsQuery();

  // Use real stats if available, otherwise fallback to mock for design preview
  const stats = realStats || mockStats;

  // Show error toast if query fails (but we still show mock data for design)
  useEffect(() => {
    if (error) {
      toast.error(
        extractErrorMessage(
          error,
          "Failed to load real stats, showing preview data"
        )
      );
    }
  }, [error]);

  if (isLoading && !realStats) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
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
      description: "Items you've purchased",
    },
    {
      title: "Total Spent",
      value: formatPrice(stats?.totalSpent || 0, { alwaysShowDecimals: true }),
      icon: DollarSign,
      gradient: "from-emerald-500/10 to-emerald-600/5",
      iconColor: "text-emerald-600",
      description: "Lifetime investment",
    },
    {
      title: "Active Orders",
      value: stats?.pendingOrders || 0,
      icon: Clock,
      gradient: "from-amber-500/10 to-amber-600/5",
      iconColor: "text-amber-600",
      description: "On their way to you",
    },
    {
      title: "Success Rate",
      value: "100%",
      icon: CheckCircle,
      gradient: "from-primary-500/10 to-primary-600/5",
      iconColor: "text-primary-600",
      description: "Successful deliveries",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-2xl border border-border/40 bg-surface-muted/20 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/20 hover:-translate-y-1"
            >
              <div
                className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.gradient} rounded-bl-full opacity-50 transition-transform duration-500 group-hover:scale-110`}
              />

              <div className="relative flex flex-col h-full space-y-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.gradient.replace(
                    "to-",
                    "bg-"
                  )} bg-opacity-20`}
                >
                  <Icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>

                <div>
                  <Text
                    variant="meta"
                    className="font-bold text-muted-fg uppercase tracking-widest text-[10px]"
                  >
                    {card.title}
                  </Text>
                  <p className="text-3xl font-black text-fg tracking-tighter mt-1">
                    {card.value}
                  </p>
                  <Text
                    variant="meta"
                    className="text-muted-fg/70 mt-1 line-clamp-1"
                  >
                    {card.description}
                  </Text>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <Heading level="h4" className="text-xl tracking-tight font-bold">
              Recent Activity
            </Heading>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-600 font-bold uppercase tracking-widest text-[10px]"
            >
              View All <ArrowRight className="ml-1.5 w-3 h-3" />
            </Button>
          </div>

          <div className="rounded-2xl border border-border/40 bg-surface-muted/20 overflow-hidden shadow-sm">
            {mockStats.recentActivity.map((item, idx) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-5 hover:bg-surface-muted/30 transition-colors ${
                  idx !== mockStats.recentActivity.length - 1
                    ? "border-b border-border/40"
                    : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.type === "order"
                        ? "bg-primary-50 text-primary-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {item.type === "order" ? (
                      <ShoppingBag className="w-5 h-5" />
                    ) : (
                      <TrendingUp className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-fg text-sm">{item.title}</p>
                    <p className="text-xs text-muted-fg font-medium">
                      {item.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {item.amount && (
                    <p className="font-black text-sm text-fg mb-1">
                      {item.amount}
                    </p>
                  )}
                  <Badge
                    variant={
                      item.status === "Delivered" || item.status === "Published"
                        ? "success"
                        : "warning"
                    }
                    size="sm"
                    className="px-2 py-0 h-5 text-[9px]"
                  >
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions / Shortcuts */}
        <div className="space-y-4">
          <Heading level="h4" className="text-xl tracking-tight font-bold">
            Quick Actions
          </Heading>
          <div className="grid grid-cols-1 gap-3">
            {[
              {
                title: "Track Order",
                icon: Package,
                link: "/profile?tab=orders",
              },
              {
                title: "Edit Profile",
                icon: User,
                link: "/profile?tab=account",
              },
              {
                title: "My Addresses",
                icon: MapPin,
                link: "/profile?tab=addresses",
              },
              { title: "Saved Cards", icon: CreditCard, link: "#" },
            ].map((action) => (
              <Link
                key={action.title}
                href={action.link}
                className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-surface-muted/20 hover:border-primary-500/30 hover:shadow-md hover:shadow-primary-500/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-muted flex items-center justify-center text-muted-fg group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-fg group-hover:text-primary-600 transition-colors">
                    {action.title}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-fg/40 group-hover:text-primary-600 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>

          {/* Promotion Card */}
          <div className="mt-6 rounded-2xl bg-primary-600 p-6 text-white relative overflow-hidden shadow-xl shadow-primary-500/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 space-y-4">
              <Badge
                variant="glass"
                size="sm"
                className="bg-white/20 border-white/10"
              >
                PROMO
              </Badge>
              <div>
                <Heading level="h4" className="text-lg font-bold text-white">
                  Refer a friend
                </Heading>
                <Text className="text-white/80 text-xs font-medium">
                  Get $20 for every friend who joins Shophub.
                </Text>
              </div>
              <Button
                size="sm"
                className="w-full bg-white text-primary-600 hover:bg-gray-100 font-bold border-none h-9"
              >
                Invite Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
