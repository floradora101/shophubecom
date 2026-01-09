// Professional consolidated header with navigation and actions for tech store.
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart, User, Search, ChevronDown, Menu, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useCart } from "@/features/cart/hooks";
import { CartSidebar } from "@/features/cart/components/CartSidebar";
import { AuthModal } from "@/features/auth";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { getAllCategories } from "@/lib/data/categories";
import type { Category } from "@/features/products/types";
import { motion } from "@/lib/ui-tokens";
import { AnnouncementBar } from "./AnnouncementBar";

// Shared menu design tokens
const MENU_PANEL_CLASS = "bg-gray-50 border border-border rounded-xl shadow-xl";
const MENU_PAD_CLASS = "p-4";
const MENU_SECTION_GAP = "space-y-2";
const MENU_HEADING_LINK_CLASS =
  "inline-flex rounded-md px-2 py-1 text-xs font-semibold tracking-wide text-fg uppercase transition-all duration-200 hover:bg-red-50 hover:scale-105 focus:text-red-600 focus:outline-none";
const MENU_ITEM_LINK_CLASS =
  "block rounded-md px-2 py-1.5 text-sm text-muted-fg transition-all duration-200 hover:bg-red-50 hover:scale-105 focus:text-red-600 focus:outline-none";

// Category tree building and mega-menu logic
type CategoryNode = Category & { children: CategoryNode[] };

const buildCategoryTree = (categories: Category[]): CategoryNode[] => {
  const nodeMap = new Map<string, CategoryNode>();

  for (const c of categories) {
    const id = String(c.id);
    nodeMap.set(id, {
      ...c,
      id,
      parentId: c.parentId ? String(c.parentId) : null,
      children: [],
    });
  }

  const roots: CategoryNode[] = [];
  for (const node of nodeMap.values()) {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortTree = (nodes: CategoryNode[]): CategoryNode[] =>
    nodes
      .map((n) => ({ ...n, children: sortTree(n.children) }))
      .sort((a, b) => a.name.localeCompare(b.name));

  return sortTree(roots);
};

const MegaMenu = ({ categoryTree }: { categoryTree: CategoryNode[] }) => {
  return (
    <div
      id="shop-all-menu"
      role="menu"
      aria-label="Shop all categories"
      className={`${MENU_PANEL_CLASS} ${MENU_PAD_CLASS} max-h-[70vh] overflow-y-auto`}
    >
      <div
        className="grid gap-x-6 gap-y-6"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        {categoryTree.map((category) => (
          <div key={category.id} className={`min-w-0 ${MENU_SECTION_GAP}`}>
            <h3 className="m-0 p-0">
              <Link
                href={`/products/category/${category.slug}`}
                className={MENU_HEADING_LINK_CLASS}
              >
                {category.name.toUpperCase()}
              </Link>
            </h3>

            {category.children?.length ? (
              <ul className="m-0 p-0 list-none space-y-1">
                {category.children.map((child) => (
                  <li key={child.id} className="m-0 p-0">
                    <Link
                      href={`/products/category/${child.slug}`}
                      className={MENU_ITEM_LINK_CLASS}
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

function SearchIconButton() {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    if (pathname === "/search") {
      // If already on search page, do nothing (no focus)
      return;
    }
    router.push("/search");
  };

  return (
    <button
      id="search"
      type="button"
      onClick={handleClick}
      className={`p-3 text-warm-gray-600 hover:text-red-600 ${motion(
        "hover",
        "colors"
      )} focus:outline-none rounded-lg`}
      aria-label="Search"
    >
      <Search className="h-5 w-5" />
    </button>
  );
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      logout: state.logout,
    }))
  );
  const userFirstName = user?.firstName;
  const isAuthenticated = !!user;
  const { totalItems: cartCount, toggleCart } = useCart();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">(
    "login"
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Category data
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    getAllCategories().then(setCategories).catch(console.error);
  }, []);
  const categoryTree = useMemo(
    () => buildCategoryTree(categories),
    [categories]
  );

  // Keyboard shortcut: Cmd/Ctrl+K to open search (desktop only)
  useEffect(() => {
    // Only enable keyboard shortcut on desktop screens (width >= 1024px)
    const isDesktop = window.innerWidth >= 1024;

    if (!isDesktop) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (pathname !== "/search") {
          router.push("/search");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pathname, router]);

  return (
    <>
      {/* Sticky Header Stack */}
      <div className="sticky top-0 z-sticky">
        {/* Announcement Bar */}
        <AnnouncementBar />

        {/* Professional Consolidated Header */}
        <header
          id="navigation"
          className="w-full bg-linear-to-br from-gray-50 via-gray-100 to-gray-200/40 border-b border-border shadow-sm"
          role="banner"
        >
          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative">
            {/* Top Bar - Logo, Search, Cart, Auth */}
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link
                href="/"
                className="flex items-center shrink-0 hover:opacity-90 transition-opacity duration-200 rounded-lg px-2 py-1 -mx-2"
              >
                <Image
                  src="/logo.png"
                  alt="ShopHub Logo"
                  width={120}
                  height={120}
                  className="object-contain"
                />
              </Link>

              {/* Desktop Navigation - Categories */}
              <NavigationMenu.Root className="hidden lg:flex items-center justify-center flex-1 mx-8">
                <NavigationMenu.List className="flex items-center w-full justify-center">
                  {/* Shop All Mega Menu */}
                  <NavigationMenu.Item>
                    <NavigationMenu.Trigger className="flex h-full items-center gap-2 px-4 text-sm font-semibold text-primary-600 hover:bg-red-50 hover:scale-105 transition-all duration-200 rounded-lg data-[state=open]:text-red-700 data-[state=open]:bg-red-50">
                      Shop All
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                    </NavigationMenu.Trigger>

                    <NavigationMenu.Content className="absolute left-1/2 top-full mt-2 z-50">
                      <div className="fixed left-[50vw] -translate-x-1/2 w-[min(100vw-2rem,80rem)]">
                        <MegaMenu categoryTree={categoryTree} />
                      </div>
                    </NavigationMenu.Content>
                  </NavigationMenu.Item>

                  {/* Individual Category Links */}
                  {categoryTree.slice(0, 6).map((category) => (
                    <NavigationMenu.Item
                      key={category.id}
                      className="relative h-full"
                    >
                      {category.children?.length > 0 ? (
                        <>
                          <NavigationMenu.Trigger className="flex h-full items-center gap-1.5 px-4 text-sm font-medium text-muted-fg hover:bg-red-50 hover:scale-105 transition-all duration-200 rounded-lg data-[state=open]:text-red-600 data-[state=open]:bg-red-50">
                            {category.name.toUpperCase()}
                            <ChevronDown className="h-3 w-3 transition-transform duration-200 data-[state=open]:rotate-180" />
                          </NavigationMenu.Trigger>

                          <NavigationMenu.Content className="absolute left-1/2 top-full -translate-x-1/2 mt-2 z-50">
                            <div
                              className={`${MENU_PANEL_CLASS} w-72 ${MENU_PAD_CLASS}`}
                            >
                              <div className={MENU_SECTION_GAP}>
                                <Link
                                  href={`/products/category/${category.slug}`}
                                  className={MENU_HEADING_LINK_CLASS}
                                >
                                  {category.name.toUpperCase()}
                                </Link>

                                <div className="space-y-1">
                                  {category.children.map((child) => (
                                    <Link
                                      key={child.id}
                                      href={`/products/category/${child.slug}`}
                                      className={MENU_ITEM_LINK_CLASS}
                                    >
                                      {child.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </NavigationMenu.Content>
                        </>
                      ) : (
                        <NavigationMenu.Link asChild>
                          <Link
                            href={`/products/category/${category.slug}`}
                            className="flex h-full items-center px-4 text-sm font-medium text-muted-fg hover:text-red-600 transition-colors rounded-lg"
                          >
                            {category.name.toUpperCase()}
                          </Link>
                        </NavigationMenu.Link>
                      )}
                    </NavigationMenu.Item>
                  ))}

                  {/* More Categories */}
                  {categoryTree.length > 6 && (
                    <NavigationMenu.Item>
                      <NavigationMenu.Link asChild>
                        <Link
                          href="/products"
                          className="flex h-full items-center px-4 text-sm font-medium text-muted-fg hover:bg-red-50 hover:scale-105 transition-all duration-200 rounded-lg"
                        >
                          More
                        </Link>
                      </NavigationMenu.Link>
                    </NavigationMenu.Item>
                  )}
                </NavigationMenu.List>
              </NavigationMenu.Root>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Search */}
                <SearchIconButton />

                {/* Cart */}
                <button
                  type="button"
                  onClick={() => toggleCart(true)}
                  className={`relative p-3 text-warm-gray-600 hover:text-red-600 ${motion(
                    "hover",
                    "colors"
                  )} focus:outline-none rounded-lg`}
                  aria-label="Open cart"
                  suppressHydrationWarning
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-linear-to-br from-primary-500 to-primary-600 text-[10px] font-bold text-white shadow-lg shadow-primary-500/40"
                      suppressHydrationWarning
                    >
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* User Menu */}
                {isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white border border-warm-gray-300 text-warm-gray-700 hover:text-primary-600 hover:border-primary-500 transition-colors rounded-lg"
                      onClick={() => router.push("/profile?tab=dashboard")}
                    >
                      <User className="h-4 w-4" />
                      <span className="hidden xl:inline font-medium ml-2">
                        {userFirstName}
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        await logout();
                        router.push("/login");
                      }}
                      className="hidden xl:flex bg-white border border-warm-gray-300 text-warm-gray-700 hover:text-primary-600 hover:border-primary-500 transition-colors rounded-lg"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAuthModalTab("login");
                        setAuthModalOpen(true);
                      }}
                      className="bg-white border border-warm-gray-300 text-warm-gray-700 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-colors rounded-lg"
                    >
                      Login
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setAuthModalTab("register");
                        setAuthModalOpen(true);
                      }}
                      className="hidden xl:flex rounded-lg"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-3 text-warm-gray-600 hover:text-red-600 transition-colors rounded-lg"
                  aria-label="Toggle mobile menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="lg:hidden border-t border-border bg-linear-to-br from-gray-50 via-gray-100 to-gray-200/40">
                <nav className="px-4 py-6 space-y-4">
                  {/* Shop All */}
                  <Link
                    href="/products"
                    className="block px-4 py-2 text-base font-semibold text-primary-600 hover:bg-red-50 hover:scale-105 transition-all duration-200 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Shop All
                  </Link>

                  {/* Categories */}
                  <div className="space-y-4">
                    {categoryTree.map((category) => (
                      <div
                        key={category.id}
                        className="border-b border-border pb-4 last:border-b-0"
                      >
                        <Link
                          href={`/products/category/${category.slug}`}
                          className="block px-4 py-2 text-sm font-medium text-fg hover:bg-red-50 hover:scale-105 transition-all duration-200 uppercase rounded-lg"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {category.name.toUpperCase()}
                        </Link>

                        {category.children?.length > 0 && (
                          <div className="ml-6 mt-2 space-y-1">
                            {category.children.map((child) => (
                              <Link
                                key={child.id}
                                href={`/products/category/${child.slug}`}
                                className="block px-4 py-1.5 text-sm text-muted-fg hover:bg-red-50 hover:scale-105 transition-all duration-200 rounded-lg"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </nav>
              </div>
            )}
          </div>
        </header>
      </div>

      <CartSidebar />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </>
  );
}
