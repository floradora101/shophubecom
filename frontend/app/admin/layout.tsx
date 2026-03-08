"use client";

import React from "react";
import Link from "next/link";
import { AdminSidebar } from "./_components/AdminSidebar";
import { useSidebarStore } from "@/store/sidebar-store";
import { useAuthStore } from "@/store/auth-store";
import { useShallow } from "zustand/react/shallow";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu, Bell, ShieldAlert } from "lucide-react";
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
          {/* Responsive Header */}
          <header className="h-16 bg-white border-b border-warm-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 shrink-0">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={toggleMobile}
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5 text-warm-gray-600" />
              </Button>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <Button variant="ghost" size="icon" className="relative text-warm-gray-600 h-9 w-9">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary-600 rounded-full border-2 border-white" />
              </Button>
              <div className="h-8 w-px bg-warm-gray-200 mx-1 hidden sm:block" />
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

