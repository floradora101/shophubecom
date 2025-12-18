// Customer profile dashboard page.
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
// TODO: Re-enable authentication protection after testing
// import { useAuthStore } from "@/store/auth-store";
// import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProfileDashboard } from "@/components/profile/ProfileDashboard";
import { ProfileOrders } from "@/components/profile/ProfileOrders";
import { ProfileAddresses } from "@/components/profile/ProfileAddresses";
import { ProfileAccountDetails } from "@/components/profile/ProfileAccountDetails";

type ProfileTab = "dashboard" | "orders" | "addresses" | "account";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // TODO: Re-enable authentication protection after testing
  // const { isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();

  // Get tab from URL or default to dashboard
  const tabFromUrl = searchParams.get("tab") as ProfileTab | null;
  const validTab: ProfileTab =
    tabFromUrl &&
    ["dashboard", "orders", "addresses", "account"].includes(tabFromUrl)
      ? tabFromUrl
      : "dashboard";

  // Use URL parameter as source of truth, with local state for immediate UI updates
  const [activeTab, setActiveTab] = useState<ProfileTab>(validTab);

  // Sync local state with URL when URL changes (e.g., browser back/forward)
  useEffect(() => {
    setActiveTab(validTab);
  }, [validTab]);

  // Update URL and state when tab changes
  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
    router.replace(`/profile?tab=${tab}`, { scroll: false });
  };

  // TODO: Re-enable authentication protection after testing
  // useEffect(() => {
  //   checkAuth();
  // }, [checkAuth]);

  // useEffect(() => {
  //   if (!authLoading && !isAuthenticated) {
  //     router.push("/auth?tab=login");
  //   }
  // }, [isAuthenticated, authLoading, router]);

  // if (authLoading) {
  //   return (
  //     <div className="flex min-h-screen flex-col bg-white">
  //       <Header />
  //       <main className="flex-1 flex items-center justify-center">
  //         <LoadingSpinner />
  //       </main>
  //       <Footer />
  //     </div>
  //   );
  // }

  // if (!isAuthenticated) {
  //   return null;
  // }

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "orders", label: "Orders" },
    { id: "addresses", label: "Addresses" },
    { id: "account", label: "Account Details" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                    ${
                      activeTab === tab.id
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "dashboard" && <ProfileDashboard />}
            {activeTab === "orders" && <ProfileOrders />}
            {activeTab === "addresses" && <ProfileAddresses />}
            {activeTab === "account" && <ProfileAccountDetails />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
