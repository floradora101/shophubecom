// Professional consolidated header with navigation and actions for tech store.
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart, User, UserPlus, Search, ChevronDown, Menu, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useCart } from "@/features/cart/hooks";
// Code-split CartSidebar - only loads when cart is opened
const CartSidebar = dynamic(
  () => import("@/features/cart/components/CartSidebar").then((mod) => ({
    default: mod.CartSidebar,
  })),
  { ssr: false }
);
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { Category } from "@/features/products/types";
import { productRoutes } from "@/lib/routes";
import { AnnouncementBar } from "./AnnouncementBar";
import { cn } from "@/lib/utils";
import { USE_MOCKS } from "@/lib/flags";
import { useCategoryTree } from "@/app/(shop)/products/hooks/useCategoryTree";

// Shared menu design tokens
const MENU_PANEL_CLASS =
  "bg-white border border-border rounded-lg shadow-2xl overflow-hidden backdrop-blur-xl bg-white/95";
const MENU_PAD_CLASS = "p-6";
const MENU_SECTION_GAP = "space-y-4";
const MENU_HEADING_LINK_CLASS =
  "inline-flex text-[11px] font-bold tracking-[0.15em] text-fg uppercase transition-all duration-200 hover:text-primary-600 focus:text-primary-600 focus:outline-none cursor-pointer";
const MENU_ITEM_LINK_CLASS =
  "block text-sm text-muted-fg transition-all duration-200 hover:text-primary-600 hover:translate-x-1 focus:text-primary-600 focus:outline-none cursor-pointer";

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
  const pathname = usePathname();
  const isCategoryActive = (slug: string) =>
    pathname === productRoutes.category(slug);

  return (
    <nav
      id="shop-all-menu"
      role="navigation"
      aria-label="Shop all categories"
      className={cn(
        MENU_PANEL_CLASS,
        MENU_PAD_CLASS,
        "max-h-[75vh] overflow-y-auto"
      )}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-10 gap-y-10">
        {categoryTree.map((category) => (
          <div key={category.id} className={cn("min-w-0", MENU_SECTION_GAP)}>
            <h3 className="m-0 p-0">
              <Link
                href={productRoutes.category(category.slug)}
                className={cn(
                  MENU_HEADING_LINK_CLASS,
                  isCategoryActive(category.slug) && "text-primary-600"
                )}
              >
                {category.name.toUpperCase()}
              </Link>
            </h3>

            {category.children?.length ? (
              <ul className="m-0 p-0 list-none space-y-2.5">
                {category.children.map((child) => (
                  <li key={child.id} className="m-0 p-0">
                    <Link
                      href={productRoutes.category(child.slug)}
                      className={cn(
                        MENU_ITEM_LINK_CLASS,
                        isCategoryActive(child.slug) &&
                          "text-primary-600 font-medium translate-x-1"
                      )}
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
    </nav>
  );
};

function SearchIconButton() {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    if (pathname === "/search") return;
    router.push("/search");
  };

  return (
    <button
      id="search"
      type="button"
      onClick={handleClick}
      className={cn(
        "p-2 sm:p-2.5 text-muted-fg hover:text-primary-600 transition-all duration-200 focus:outline-none rounded-lg hover:bg-primary-50 cursor-pointer",
        pathname === "/search" && "text-primary-600 bg-primary-50"
      )}
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuToggleRef = useRef<HTMLButtonElement>(null);

  // Focus trap for mobile menu
  useEffect(() => {
    if (!isMobileMenuOpen || !mobileMenuRef.current) return;

    const container = mobileMenuRef.current;
    const toggleButton = mobileMenuToggleRef.current;
    const focusables = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      toggleButton?.focus();
    };
  }, [isMobileMenuOpen]);

  const { categories: storefrontCategories } = useCategoryTree();

  // API returns tree structure already, but buildCategoryTree can handle both flat and tree structures
  const categoryTree = useMemo(
    () => {
      return buildCategoryTree(storefrontCategories);
    },
    [storefrontCategories]
  );

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname?.startsWith(path + "/");
  };

  const isCategoryActive = (slug: string) => {
    return pathname === `/products/category/${slug}`;
  };

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
          className="w-full bg-white/90 backdrop-blur-md border-b border-border shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          role="banner"
        >
          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative">
            {/* Top Bar - Logo, Search, Cart, Auth */}
            <div className="flex h-16 sm:h-20 items-center justify-between">
              {/* Logo */}
              <Link
                href="/"
                className="flex items-center shrink-0 hover:opacity-90 transition-opacity duration-200 rounded-xl"
              >
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={140}
                  height={140}
                  className="object-contain w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
                  sizes="(max-width: 640px) 80px, (max-width: 1024px) 100px, 140px"
                  priority
                />
              </Link>

              {/* Desktop Navigation - Categories - Hidden until loaded to prevent flash */}
              {categoryTree.length > 0 && (
                <NavigationMenu.Root className="hidden lg:flex items-center justify-center flex-1 mx-12">
                  <NavigationMenu.List className="flex items-center gap-2">
                    {/* Shop All Mega Menu */}
                    <NavigationMenu.Item>
                      <NavigationMenu.Trigger
                        className={cn(
                          "flex h-10 items-center gap-2 px-5 text-[13px] font-bold tracking-wider text-primary-600 transition-all duration-300 rounded-lg hover:bg-primary-50 data-[state=open]:bg-primary-50 cursor-pointer",
                          isActive("/products") && "bg-primary-50"
                        )}
                      >
                        SHOP ALL
                        <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 data-[state=open]:rotate-180" />
                      </NavigationMenu.Trigger>

                      <NavigationMenu.Content className="absolute left-1/2 top-full mt-3 z-50">
                        <div className="fixed left-[50vw] -translate-x-1/2 w-[min(100vw-2rem,85rem)] animate-in fade-in slide-in-from-top-2 duration-300">
                          <MegaMenu categoryTree={categoryTree} />
                        </div>
                      </NavigationMenu.Content>
                    </NavigationMenu.Item>

                    {/* Individual Category Links */}
                    {categoryTree.slice(0, 5).map((category) => (
                      <NavigationMenu.Item
                        key={category.id}
                        className="relative h-full"
                      >
                        {category.children?.length > 0 ? (
                          <>
                            <NavigationMenu.Trigger
                              className={cn(
                                "flex h-10 items-center gap-1.5 px-4 text-[13px] font-semibold text-muted-fg transition-all duration-300 rounded-lg hover:bg-gray-50 hover:text-fg data-[state=open]:bg-gray-50 data-[state=open]:text-primary-600 cursor-pointer",
                                isCategoryActive(category.slug) &&
                                  "text-primary-600 bg-primary-50"
                              )}
                            >
                              {category.name.toUpperCase()}
                              <ChevronDown className="h-3 w-3 transition-transform duration-300 data-[state=open]:rotate-180" />
                            </NavigationMenu.Trigger>

                            <NavigationMenu.Content className="absolute left-1/2 top-full -translate-x-1/2 mt-3 z-50">
                              <div
                                className={cn(
                                  MENU_PANEL_CLASS,
                                  "w-72",
                                  MENU_PAD_CLASS,
                                  "animate-in fade-in slide-in-from-top-2 duration-300"
                                )}
                              >
                                <div className={MENU_SECTION_GAP}>
                                  <Link
                                    href={productRoutes.category(category.slug)}
                                    className={MENU_HEADING_LINK_CLASS}
                                  >
                                    {category.name.toUpperCase()}
                                  </Link>

                                  <div className="space-y-2">
                                    {category.children.map((child) => (
                                      <Link
                                        key={child.id}
                                        href={productRoutes.category(child.slug)}
                                        className={cn(
                                          MENU_ITEM_LINK_CLASS,
                                          isCategoryActive(child.slug) &&
                                            "text-primary-600 font-medium translate-x-1"
                                        )}
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
                              href={productRoutes.category(category.slug)}
                              className={cn(
                                "flex h-10 items-center px-4 text-[13px] font-semibold text-muted-fg transition-all duration-300 rounded-lg hover:bg-gray-50 hover:text-fg cursor-pointer",
                                isCategoryActive(category.slug) &&
                                  "text-primary-600 bg-primary-50"
                              )}
                            >
                              {category.name.toUpperCase()}
                            </Link>
                          </NavigationMenu.Link>
                        )}
                      </NavigationMenu.Item>
                    ))}

                    {/* More Categories */}
                    {categoryTree.length > 5 && (
                      <NavigationMenu.Item>
                        <NavigationMenu.Link asChild>
                          <Link
                            href="/categories"
                            className={cn(
                              "flex h-10 items-center px-5 text-[13px] font-semibold text-muted-fg transition-all duration-300 rounded-lg hover:bg-gray-50 hover:text-fg cursor-pointer",
                              pathname === "/categories" &&
                                "text-primary-600 bg-primary-50"
                            )}
                          >
                            MORE
                          </Link>
                        </NavigationMenu.Link>
                      </NavigationMenu.Item>
                    )}
                  </NavigationMenu.List>
                </NavigationMenu.Root>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Search */}
                <SearchIconButton />

                {/* Cart */}
                <button
                  type="button"
                  onClick={() => toggleCart(true)}
                  className="group relative p-2 sm:p-2.5 text-muted-fg hover:text-primary-600 transition-all duration-200 focus:outline-none rounded-lg hover:bg-primary-50 cursor-pointer"
                  aria-label="Open cart"
                  suppressHydrationWarning
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span
                      className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white"
                      suppressHydrationWarning
                    >
                      {cartCount}
                    </span>
                  )}
                </button>

                <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

                {/* User Menu */}
                {isAuthenticated ? (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg px-3 text-muted-fg hover:text-primary-600 hover:bg-primary-50 font-medium transition-all"
                      onClick={() => router.push("/profile?tab=dashboard")}
                    >
                      <User className="h-4 w-4 sm:mr-2" />
                      <span className="hidden xl:inline">{userFirstName}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        await logout();
                        router.push("/login");
                      }}
                      className="hidden xl:flex rounded-lg text-muted-fg hover:text-primary-600 hover:bg-primary-50"
                    >
                      Logout
                    </Button>
                  </div>
                ) : USE_MOCKS ? (
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button
                        className="flex items-center justify-center w-10 h-10 rounded-lg text-muted-fg hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer"
                        aria-label="Account mode information"
                        aria-haspopup="menu"
                      >
                        <User className="h-5 w-5" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        className={cn(
                          MENU_PANEL_CLASS,
                          "w-72",
                          MENU_PAD_CLASS,
                          "animate-in fade-in slide-in-from-top-2 duration-200"
                        )}
                        sideOffset={12}
                        align="end"
                        aria-label="Mock mode account information"
                      >
                        <div className={MENU_SECTION_GAP}>
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-fg">
                              Auth is unavailable in mock mode
                            </p>
                            <p className="text-sm text-warm-gray-600 leading-relaxed">
                              Storefront catalog browsing is mocked, but sign-in,
                              account management, and order tracking still require
                              backend mode.
                            </p>
                          </div>
                        </div>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                ) : (
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button
                        className="flex items-center justify-center w-10 h-10 rounded-lg text-muted-fg hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer"
                        aria-label="Account menu"
                        aria-haspopup="menu"
                      >
                        <User className="h-5 w-5" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        className={cn(
                          MENU_PANEL_CLASS,
                          "w-72",
                          MENU_PAD_CLASS,
                          "animate-in fade-in slide-in-from-top-2 duration-200"
                        )}
                        sideOffset={12}
                        align="end"
                        aria-label="Account options"
                      >
                        <div className={MENU_SECTION_GAP}>
                          <div className="space-y-3">
                            <DropdownMenu.Item asChild>
                              <Link
                                href="/login"
                                className={cn(
                                  MENU_ITEM_LINK_CLASS,
                                  "flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-primary-50 font-medium outline-none cursor-pointer"
                                )}
                              >
                                <span>Sign In</span>
                                <User className="h-4 w-4 text-primary-600" />
                              </Link>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item asChild>
                              <Link
                                href="/register"
                                className={cn(
                                  MENU_ITEM_LINK_CLASS,
                                  "flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-primary-50 font-bold outline-none cursor-pointer"
                                )}
                              >
                                <span>Create Account</span>
                                <UserPlus className="h-4 w-4 text-primary-600" />
                              </Link>
                            </DropdownMenu.Item>
                          </div>

                          <div className="pt-3 border-t border-warm-gray-100">
                            <p className="text-sm text-warm-gray-600 leading-relaxed">
                              Create an account for faster checkout and order tracking, or continue shopping as a guest.
                            </p>
                          </div>
                        </div>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                )}

                {/* Mobile Menu Toggle */}
                <button
                  ref={mobileMenuToggleRef}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 text-muted-fg hover:text-primary-600 transition-all rounded-lg hover:bg-primary-50 cursor-pointer"
                  aria-label="Toggle mobile menu"
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-menu"
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
              <div
                id="mobile-menu"
                ref={mobileMenuRef}
                className="lg:hidden border-t border-border bg-white rounded-b-lg animate-in slide-in-from-top duration-300"
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation"
              >
                <nav className="px-4 py-8 space-y-6 max-h-[80vh] overflow-y-auto">
                  {/* Shop All */}
                  <Link
                    href="/products"
                    className={cn(
                      "block px-4 py-3 text-sm font-bold tracking-wider text-primary-600 hover:bg-primary-50 rounded-lg transition-all",
                      isActive("/products") && "bg-primary-50"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    SHOP ALL
                  </Link>

                  {/* Categories - Only show when loaded to prevent flash */}
                  {categoryTree.length > 0 && (
                    <div className="space-y-6">
                      {categoryTree.map((category) => (
                        <div key={category.id} className="space-y-3">
                          <Link
                            href={productRoutes.category(category.slug)}
                            className={cn(
                              "block px-4 py-2 text-sm font-bold tracking-widest text-fg hover:text-primary-600 transition-all uppercase",
                              isCategoryActive(category.slug) &&
                                "text-primary-600"
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {category.name.toUpperCase()}
                          </Link>

                          {category.children?.length > 0 && (
                            <div className="ml-4 grid grid-cols-1 gap-1 border-l-2 border-border pl-4">
                              {category.children.map((child) => (
                                <Link
                                  key={child.id}
                                  href={productRoutes.category(child.slug)}
                                  className={cn(
                                    "block px-4 py-2 text-[13px] text-muted-fg hover:text-primary-600 hover:translate-x-1 transition-all rounded-lg",
                                    isCategoryActive(child.slug) &&
                                      "text-primary-600 font-medium bg-primary-50/50"
                                  )}
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
                  )}
                </nav>
              </div>
            )}
          </div>
        </header>
      </div>

      <CartSidebar />
    </>
  );
}
