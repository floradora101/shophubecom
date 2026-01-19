// Customer profile dashboard page.
"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  MapPin,
  User,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Clock,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/spinner";
import { ProfileDashboard } from "@/features/profile/components/ProfileDashboard";
import { ProfileOrders } from "@/features/profile/components/ProfileOrders";
import { ProfileAddresses } from "@/features/profile/components/ProfileAddresses";
import { ProfileAccountDetails } from "@/features/profile/components/ProfileAccountDetails";
import { BadgedSectionTitle } from "@/components/ui/SectionTitle";
import { Tabs, TabItem } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ProfileTab = "dashboard" | "orders" | "addresses" | "account";

// Mock user data for the enhanced profile design
const mockUser = {
  name: "Alex Thompson",
  email: "alex.thompson@example.com",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
  memberSince: "January 2024",
  tier: "Gold Member",
  ordersCount: 12,
  savedAddresses: 2,
};

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get tab from URL or default to dashboard
  const tabFromUrl = searchParams.get("tab") as ProfileTab | null;
  const validTab: ProfileTab =
    tabFromUrl &&
    ["dashboard", "orders", "addresses", "account"].includes(tabFromUrl)
      ? tabFromUrl
      : "dashboard";

  // Update URL and state when tab changes
  const handleTabChange = (tabId: string) => {
    router.replace(`/profile?tab=${tabId}`, { scroll: false });
  };

  const tabs: TabItem[] = useMemo(
    () => [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard className="w-4 h-4" />,
        content: <ProfileDashboard />,
      },
      {
        id: "orders",
        label: "Orders",
        icon: <ShoppingBag className="w-4 h-4" />,
        badge: mockUser.ordersCount,
        content: <ProfileOrders />,
      },
      {
        id: "addresses",
        label: "Addresses",
        icon: <MapPin className="w-4 h-4" />,
        content: <ProfileAddresses />,
      },
      {
        id: "account",
        label: "Account",
        icon: <User className="w-4 h-4" />,
        content: <ProfileAccountDetails />,
      },
    ],
    []
  );

  return (
    <main className="flex-1 bg-surface-muted/30 pb-20">
      {/* Premium Header Section */}
      <div className="bg-transparent border-b border-border/40 pt-12 pb-16 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <BadgedSectionTitle
            badgeText="Member Profile"
            title={`Welcome back, ${mockUser.name.split(" ")[0]}`}
            subtitle="Manage your orders, addresses, and account settings in one place."
            className="text-left md:text-center max-w-none mb-12"
          />

          {/* User Brief Info Card */}
          <div className="max-w-4xl mx-auto mt-8 flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-surface-muted/30 border border-border/40 shadow-xl backdrop-blur-sm">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={mockUser.avatar} />
                <AvatarFallback className="bg-primary-600 text-white font-bold text-2xl">
                  {mockUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-sm" />
            </div>

            <div className="flex-1 text-center md:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h2 className="text-2xl font-bold text-fg tracking-tight">
                  {mockUser.name}
                </h2>
                <Badge
                  variant="primary"
                  size="sm"
                  className="bg-amber-500 border-none"
                >
                  {mockUser.tier}
                </Badge>
              </div>
              <p className="text-muted-fg font-medium flex items-center justify-center md:justify-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary-500" />
                {mockUser.email}
              </p>
              <p className="text-xs font-bold text-muted-fg/60 uppercase tracking-widest pt-1 flex items-center justify-center md:justify-start gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Member since {mockUser.memberSince}
              </p>
            </div>

            <div className="hidden lg:flex items-center gap-8 px-8 border-l border-border/50">
              <div className="text-center">
                <p className="text-2xl font-black text-fg tracking-tighter">
                  {mockUser.ordersCount}
                </p>
                <p className="text-[10px] font-black text-muted-fg uppercase tracking-widest">
                  Orders
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-fg tracking-tighter">
                  {mockUser.savedAddresses}
                </p>
                <p className="text-[10px] font-black text-muted-fg uppercase tracking-widest">
                  Addresses
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Tab Navigation */}
          <div className="bg-surface-muted/50 backdrop-blur-md p-2 sm:p-4 rounded-2xl shadow-lg border border-border/40">
            <Tabs
              tabs={tabs}
              defaultTab={validTab}
              onTabChange={handleTabChange}
              variant="pill"
              size="lg"
              className="mt-0"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner variant="full" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
