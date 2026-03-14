"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  Image as ImageIcon,
  LogOut,
  ChevronRight,
  Ticket,
  LayoutGrid,
  Megaphone,
  Bell,
  ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Text } from "@/components/ui/typography";
import { useSidebarStore } from "@/store/sidebar-store";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    href: "/admin/orders",
  },
  {
    title: "Categories",
    icon: Layers,
    href: "/admin/categories",
  },
  {
    title: "Subcategory Showcase",
    icon: LayoutGrid,
    href: "/admin/subcategories",
  },
  {
    title: "Products",
    icon: Package,
    href: "/admin/products",
  },
  {
    title: "Hero Slides",
    icon: ImageIcon,
    href: "/admin/hero-slides",
  },
  {
    title: "Coupons",
    icon: Ticket,
    href: "/admin/coupons",
  },
  {
    title: "Promotions",
    icon: Megaphone,
    href: "/admin/promotions",
  },
  {
    title: "Announcements",
    icon: Bell,
    href: "/admin/announcements",
  },
];

export function AdminSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const { closeMobile } = useSidebarStore();

  const sidebarContent = (
    <div className={cn(
      "flex flex-col h-full bg-white",
      !isMobile && "w-64 border-r border-warm-gray-200"
    )}>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="px-2 py-2">
          <Text className="text-[10px] font-bold text-warm-gray-400 uppercase tracking-widest">
            Management
          </Text>
        </div>
        {menuItems.map((item) => {
          // Dashboard is active only on exact match /admin
          // Other items are active on prefix match /admin/categories...
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobile}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-primary-50 text-primary-700 shadow-sm"
                  : "text-warm-gray-600 hover:bg-warm-gray-50 hover:text-warm-gray-900"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                isActive ? "text-primary-600" : "text-warm-gray-400 group-hover:text-warm-gray-600"
              )} />
              <span className="font-medium text-sm">{item.title}</span>
              {isActive && (
                <ChevronRight className="w-4 h-4 ml-auto text-primary-400" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-warm-gray-100 mt-auto">
        <button
          className="flex items-center gap-3 w-full px-3 py-2.5 text-warm-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
          onClick={() => {
            closeMobile();
          }}
        >
          <LogOut className="w-5 h-5 text-warm-gray-400 group-hover:text-red-500" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );

  if (isMobile) return sidebarContent;

  return (
    <aside className="hidden lg:flex flex-col h-screen sticky top-0 shrink-0">
      {sidebarContent}
    </aside>
  );
}
