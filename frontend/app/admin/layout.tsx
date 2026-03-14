"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { AdminSidebar } from "./_components/AdminSidebar";
import { useSidebarStore } from "@/store/sidebar-store";
import { useAuthStore } from "@/store/auth-store";
import { useShallow } from "zustand/react/shallow";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { RequireAdmin } from "@/features/auth/components/RequireAdmin";
import { USE_MOCKS } from "@/lib/flags";

function getInitials(firstName?: string | null, lastName?: string | null): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  if (lastName) return lastName.slice(0, 2).toUpperCase();
  return "AD";
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMobileOpen, toggleMobile, closeMobile } = useSidebarStore();
  const user = useAuthStore(useShallow((s) => s.user));

  if (USE_MOCKS) {
    return (
      <div className="flex min-h-screen bg-warm-gray-50 items-center justify-center p-4">
        <Card className="p-10 text-center max-w-md">
          <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-fg mb-2">Admin requires backend</h2>
          <p className="text-muted-fg text-sm mb-6">
            Admin panel depends on backend auth and data. Disable mock mode to access admin.
          </p>
          <Link href="/">
            <Button variant="outline">Return to store</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <RequireAdmin>
      <div className="flex min-h-screen bg-warm-gray-50">
        {/* Desktop Sidebar */}
        <AdminSidebar />

        {/* Mobile Sidebar (Sheet) */}
        <Sheet open={isMobileOpen} onOpenChange={closeMobile}>
          <SheetContent side="left" className="p-0 w-72 border-none">
            <AdminSidebar isMobile />
          </SheetContent>
        </Sheet>

        <div className="flex-1 flex flex-col min-w-0 h-screen">
          {/* Responsive Header - aligned with front store */}
          <header
            className="h-16 sm:h-20 w-full bg-white/90 backdrop-blur-md border-b border-border shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex items-center justify-between px-4 md:px-6 lg:px-8 sticky top-0 z-40 shrink-0"
            role="banner"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden shrink-0 h-9 w-9"
                onClick={toggleMobile}
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5 text-warm-gray-600" />
              </Button>
              <Link
                href="/"
                className="flex items-center shrink-0 hover:opacity-90 transition-opacity duration-200 rounded-xl"
              >
                <Image
                  src="/logo.png"
                  alt="ShopHub"
                  width={140}
                  height={140}
                  className="object-contain w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20"
                  sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, (max-width: 1024px) 64px, 80px"
                  priority
                />
              </Link>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-warm-gray-50 rounded-lg h-10">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs shrink-0">
                  {getInitials(user?.firstName, user?.lastName)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-warm-gray-900 leading-none">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.firstName || user?.email?.split("@")[0] || "Admin"}
                  </p>
                  <p className="text-[10px] text-warm-gray-500 leading-none mt-1">
                    {user?.role === "ADMIN" ? "Administrator" : user?.role || "Admin"}
                  </p>
                </div>
              </Button>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto relative bg-warm-gray-50/50">
            <Container size="lg" className="py-6 md:py-10">
              {children}
            </Container>
          </main>
        </div>
      </div>
    </RequireAdmin>
  );
}

