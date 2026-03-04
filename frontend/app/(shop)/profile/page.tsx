// Customer profile dashboard page.
"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingBag, MapPin, User, Clock } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/spinner";
import { ProfileDashboard } from "@/features/profile/components/ProfileDashboard";
import { ProfileOrders } from "@/features/profile/components/ProfileOrders";
import { ProfileAddresses } from "@/features/profile/components/ProfileAddresses";
import { ProfileAccountDetails } from "@/features/profile/components/ProfileAccountDetails";
import { BadgedSectionTitle } from "@/components/ui/SectionTitle";
import { Tabs, TabItem } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useProfileQuery } from "@/features/profile/queries";
import { useOrderStatsQuery } from "@/features/orders/queries";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Stack } from "@/components/ui/stack";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

type ProfileTab = "dashboard" | "orders" | "addresses" | "account";

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { data: profileResponse, isLoading: isProfileLoading } = useProfileQuery();
  const { data: stats } = useOrderStatsQuery();
  const realUser = profileResponse?.data;

  const user = realUser
    ? {
        name: `${realUser.firstName} ${realUser.lastName}`,
        email: realUser.email,
        createdAt: realUser.createdAt,
      }
    : null;

  const ordersCount = stats?.totalOrders ?? 0;

  const memberSinceYear =
    user?.createdAt != null
      ? (() => {
          const date = new Date(user.createdAt as unknown as string);
          const year = date.getFullYear();
          return Number.isNaN(year) ? "—" : year;
        })()
      : "—";

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
        badge: ordersCount > 0 ? ordersCount : undefined,
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
    [ordersCount]
  );

  return (
    <Section spacing="lg" className="bg-surface-muted/30">
      <Container>
        <Stack spacing="xl">
          {/* Header & Stepper Pattern */}
          <Stack spacing="md" align="center">
            <BadgedSectionTitle
              badgeText="Identity Panel"
              title="User Profile"
              subtitle="Manage your orders, addresses, and account settings"
              icon={User}
            />
          </Stack>

          <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
            {/* Main Content Area */}
            <div className="space-y-6">
              <div className="bg-white/60 backdrop-blur-xl p-2 rounded-2xl shadow-sm border border-white/80">
                <Tabs
                  tabs={tabs}
                  defaultTab={validTab}
                  onTabChange={handleTabChange}
                  variant="pill"
                  size="md"
                  className="mt-0"
                />
              </div>

              <div className="mt-6">
                {tabs.find((t) => t.id === validTab)?.content}
              </div>
            </div>

            {/* Sidebar: Profile Brief Card */}
            <aside className="lg:sticky lg:top-8 h-fit">
              <Card className="p-6 bg-white border-warm-gray-200 shadow-xl shadow-warm-gray-100/50 overflow-hidden relative">
                <div className="flex flex-col gap-3">
                  <div className="text-left space-y-1">
                    <h2 className="text-lg font-black text-fg tracking-tight">
                      {user ? user.name : "Your account"}
                    </h2>
                    {user?.email && (
                      <p className="text-xs text-muted-fg font-medium">
                        {user.email}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-warm-gray-50/50 border border-warm-gray-100">
                    <Clock className="w-4 h-4 text-warm-gray-400" />
                    <div className="text-left">
                      <p className="text-[9px] font-black text-muted-fg/40 uppercase tracking-widest">
                        Member since
                      </p>
                      <p className="text-[11px] font-bold text-fg">
                        {memberSinceYear}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </aside>
          </div>
        </Stack>
      </Container>
    </Section>
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
