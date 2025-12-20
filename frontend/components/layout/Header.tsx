// Site header with navigation and actions.
"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingCart, User, Search } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { CategoryNav } from "./CategoryNav";
import { useCart } from "@/features/cart/hooks";
import { CartSidebar } from "@/features/cart/components/CartSidebar";
import { AuthModal } from "@/features/auth";

function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(urlSearch);

  // Sync local state with URL
  useEffect(() => {
    setSearchQuery(urlSearch);
  }, [urlSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/products?search=${encodeURIComponent(trimmed)}`);
    } else {
      // Clear search if empty
      const params = new URLSearchParams(searchParams.toString());
      params.delete("search");
      const newUrl = params.toString()
        ? `/products?${params.toString()}`
        : "/products";
      router.push(newUrl);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          suppressHydrationWarning
        />
      </div>
    </form>
  );
}

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore(
    useShallow((state) => ({
      // subscribe only to what Header renders
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

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 text-white font-bold text-lg">
                S
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                ShopHub
              </span>
            </Link>

            {/* Search Bar */}
            <Suspense
              fallback={
                <div className="flex-1 max-w-2xl h-10 bg-gray-100 rounded-lg animate-pulse" />
              }
            >
              <SearchBar />
            </Suspense>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Cart */}
              <button
                type="button"
                onClick={() => toggleCart(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Open cart"
                suppressHydrationWarning
              >
                <ShoppingCart className="h-5 w-5" />
                <span
                  className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white"
                  suppressHydrationWarning
                >
                  {cartCount}
                </span>
              </button>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => router.push("/profile?tab=dashboard")}
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{userFirstName}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await logout();
                      // Cart invalidation handled by AuthProvider when user state changes
                      router.push("/login");
                    }}
                    className="hidden sm:flex"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600"
                    onClick={() => {
                      setAuthModalTab("login");
                      setAuthModalOpen(true);
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    size="sm"
                    className="hidden sm:flex"
                    onClick={() => {
                      setAuthModalTab("register");
                      setAuthModalOpen(true);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <CategoryNav />
      <CartSidebar />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </>
  );
}
