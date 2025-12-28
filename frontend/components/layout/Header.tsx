// Professional consolidated header with navigation and actions for tech store.
"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import {
  mockCategories,
  mockCategoryToCategory,
} from "@/lib/mock-data/mock-data";
import type { Category } from "@/features/products/types";
import { AnnouncementBar } from "./AnnouncementBar";

// Shared menu design tokens
const MENU_PANEL_CLASS = "bg-white border border-gray-200 rounded-xl shadow-xl";
const MENU_PAD_CLASS = "p-4";
const MENU_SECTION_GAP = "space-y-2";
const MENU_HEADING_LINK_CLASS =
  "inline-flex rounded-md px-2 py-1 text-xs font-semibold tracking-wide text-gray-900 uppercase transition-colors hover:text-primary-600 focus:bg-gray-50 focus:text-primary-600 focus:outline-none";
const MENU_ITEM_LINK_CLASS =
  "block rounded-md px-2 py-1.5 text-sm text-gray-700 transition-colors hover:text-primary-600 focus:bg-gray-50 focus:text-primary-600 focus:outline-none";

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
                {category.name}
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
      className="p-3 text-warm-gray-600 hover:text-primary-600 transition-all duration-200 ease-out focus:outline-none rounded-lg hover:bg-gray-50"
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
  const [isShopAllOpen, setIsShopAllOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevPathnameRef = useRef(pathname);

  // Category data
  const categories = useMemo(
    () => mockCategories.map(mockCategoryToCategory),
    []
  );
  const categoryTree = useMemo(
    () => buildCategoryTree(categories),
    [categories]
  );

  // Keyboard shortcut: Cmd/Ctrl+K to open search
  useEffect(() => {
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

  // Shop All mega menu handlers
  const openShopAll = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsShopAllOpen(true);
  }, []);

  const closeShopAll = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsShopAllOpen(false);
    }, 150); // 150ms delay to prevent flicker
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isShopAllOpen) {
        setIsShopAllOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isShopAllOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (isShopAllOpen && !target.closest("[data-shop-all]")) {
        setIsShopAllOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isShopAllOpen]);

  // Close on route change
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      setIsShopAllOpen(false);
      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  return (
    <>
      {/* Sticky Header Stack */}
      <div className="sticky top-0 z-sticky">
        {/* Announcement Bar */}
        <AnnouncementBar />

        {/* Professional Consolidated Header */}
        <header
          id="navigation"
          className="w-full bg-white border-b border-gray-200 shadow-sm"
          role="banner"
        >
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
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
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </Link>

              {/* Desktop Navigation - Categories */}
              <nav className="hidden lg:flex items-center justify-center flex-1 mx-8">
                {/* Shop All Mega Menu */}
                <div
                  className="h-full"
                  data-shop-all
                  onMouseEnter={openShopAll}
                  onMouseLeave={closeShopAll}
                >
                  <button
                    type="button"
                    className="flex h-full items-center gap-2 px-4 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors rounded-lg hover:bg-gray-50"
                    aria-haspopup="menu"
                    aria-expanded={isShopAllOpen}
                    aria-controls="shop-all-menu"
                  >
                    Shop All
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isShopAllOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isShopAllOpen && (
                    <div className="absolute left-1/2 top-full z-60 pt-6">
                      <div className="-translate-x-1/2 w-[min(100vw-2rem,80rem)]">
                        <MegaMenu categoryTree={categoryTree} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Individual Category Links */}
                {categoryTree.slice(0, 6).map((category) => (
                  <div key={category.id} className="relative h-full">
                    {category.children?.length > 0 ? (
                      <>
                        <button
                          type="button"
                          className="peer flex h-full items-center gap-1.5 px-4 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50"
                          aria-haspopup="menu"
                        >
                          {category.name}
                          <ChevronDown className="h-3 w-3 transition-transform peer-hover:rotate-180" />
                        </button>

                        <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-6 hidden peer-hover:block hover:block">
                          <div
                            className={`${MENU_PANEL_CLASS} w-72 ${MENU_PAD_CLASS}`}
                          >
                            <div className={MENU_SECTION_GAP}>
                              <Link
                                href={`/products/category/${category.slug}`}
                                className={MENU_HEADING_LINK_CLASS}
                              >
                                {category.name}
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
                        </div>
                      </>
                    ) : (
                      <Link
                        href={`/products/category/${category.slug}`}
                        className="flex h-full items-center px-4 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50"
                      >
                        {category.name}
                      </Link>
                    )}
                  </div>
                ))}

                {/* More Categories */}
                {categoryTree.length > 6 && (
                  <Link
                    href="/products"
                    className="flex h-full items-center px-4 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50"
                  >
                    More
                  </Link>
                )}
              </nav>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Search */}
                <SearchIconButton />

                {/* Cart */}
                <button
                  type="button"
                  onClick={() => toggleCart(true)}
                  className="relative p-3 text-warm-gray-600 hover:text-primary-600 transition-all duration-200 ease-out focus:outline-none rounded-lg hover:bg-gray-50"
                  aria-label="Open cart"
                  suppressHydrationWarning
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-linear-to-br from-primary-500 to-primary-600 text-[10px] font-bold text-white shadow-lg shadow-primary-500/40 animate-pulse"
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
                      className="bg-white border border-warm-gray-300 text-warm-gray-700 hover:text-primary-600 hover:border-primary-500 transition-colors rounded-lg"
                    >
                      Login
                    </Button>
                    <Button
                      variant="default"
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
                  className="lg:hidden p-3 text-warm-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50"
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
              <div className="lg:hidden border-t border-gray-200 bg-white">
                <nav className="px-4 py-6 space-y-4">
                  {/* Shop All */}
                  <Link
                    href="/products"
                    className="block px-4 py-2 text-base font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Shop All
                  </Link>

                  {/* Categories */}
                  <div className="space-y-4">
                    {categoryTree.map((category) => (
                      <div
                        key={category.id}
                        className="border-b border-gray-100 pb-4 last:border-b-0"
                      >
                        <Link
                          href={`/products/category/${category.slug}`}
                          className="block px-4 py-2 text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors uppercase"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {category.name}
                        </Link>

                        {category.children?.length > 0 && (
                          <div className="ml-6 mt-2 space-y-1">
                            {category.children.map((child) => (
                              <Link
                                key={child.id}
                                href={`/products/category/${child.slug}`}
                                className="block px-4 py-1.5 text-sm text-gray-600 hover:text-primary-600 transition-colors"
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
