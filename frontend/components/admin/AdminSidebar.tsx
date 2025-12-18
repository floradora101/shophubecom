// Sidebar navigation for admin dashboard sections.
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Image as ImageIcon,
  Tag,
  Percent,
  Menu,
  X,
  LogOut,
  Home,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Carousels",
    href: "/admin/carousels",
    icon: ImageIcon,
  },
  {
    label: "Promotions",
    href: "/admin/promotions",
    icon: Percent,
  },
  {
    label: "Coupons",
    href: "/admin/coupons",
    icon: Tag,
  },
];

export function AdminSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // TEMPORARY: Mock user for testing - remove in production
  const mockUser = {
    firstName: "Admin",
    lastName: "User",
    email: "admin@shophub.com",
  };
  const displayUser = user || mockUser;

  const handleLogout = async () => {
    if (user) {
      await logout();
      // Cart invalidation handled by AuthProvider when user state changes
    }
    router.push("/");
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white font-bold">
              A
            </div>
            <span className="text-lg font-bold text-gray-900">Admin</span>
          </Link>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 text-gray-600 hover:text-gray-900"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 lg:top-0 left-0 z-40 h-[calc(100vh-4rem)] lg:h-screen w-64 bg-white border-r border-gray-200 transition-transform lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:z-auto`}
      >
        <div className="flex h-full flex-col">
          {/* Logo - Desktop */}
          <div className="hidden lg:flex items-center gap-3 p-6 border-b border-gray-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 text-white font-bold text-lg">
              A
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-500">ShopHub</p>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-semibold">
                {displayUser?.firstName?.[0] || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {displayUser?.firstName} {displayUser?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {displayUser?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Back to Store</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
