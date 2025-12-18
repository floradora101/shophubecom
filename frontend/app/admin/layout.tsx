// Layout shell for admin dashboard pages.
"use client";

import "@uploadthing/react/styles.css";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { RequireAuth } from "@/components/auth/RequireAuth";

/**
 * Admin Layout
 *
 * Wraps all admin routes with RequireAuth protection.
 * Ensures only authenticated ADMIN users can access admin pages.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth role="ADMIN">
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 min-w-0 lg:ml-0 pt-16 lg:pt-0">
          <div className="h-full">{children}</div>
        </main>
      </div>
    </RequireAuth>
  );
}
