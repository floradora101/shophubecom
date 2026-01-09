"use client";

import React from "react";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { AdminSidebar } from "./_components/AdminSidebar";
import { AdminTopBar } from "./_components/AdminTopBar";
import { Container } from "@/components/ui/container";

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-warm-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-warm-gray-200">
          <AdminSidebar />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 lg:pl-64">
        <AdminTopBar />
        <main className="flex-1 overflow-y-auto">
          <Container size="full" className="py-6">
            {children}
          </Container>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
