"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import {
  LayoutDashboard,
  FolderOpen,
  Package,
  Image,
  ShoppingCart,
  Tag,
  Gift,
  Users,
  FileText,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Categories", href: "/admin/categories", icon: FolderOpen },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Hero Slides", href: "/admin/hero-slides", icon: Image },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Promotions", href: "/admin/promotions", icon: Tag },
  { name: "Coupons", href: "/admin/coupons", icon: Gift },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="flex items-center h-16 px-6 border-b border-warm-gray-200">
        <Text variant="body" weight="semibold" className="text-warm-gray-900">
          ShopHub Admin
        </Text>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  isActive &&
                    "bg-primary-50 text-primary-700 hover:bg-primary-100"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="font-medium">{item.name}</span>
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
