// Site header with navigation and actions.
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart, User, Search } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { CategoryNav } from "./CategoryNav";
import { useCart } from "@/features/cart/hooks";
import { CartSidebar } from "@/features/cart/components/CartSidebar";
import { AuthModal } from "@/features/auth";

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
      type="button"
      onClick={handleClick}
      className="p-2.5 text-warm-gray-600 hover:text-primary-600 transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl"
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

  // Keyboard shortcut: Cmd/Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
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
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-gradient-to-br from-primary-50/60 via-cream-50/60 to-primary-100/30 border-b border-warm-gray-200/40 supports-[backdrop-filter]:bg-gradient-to-br supports-[backdrop-filter]:from-primary-50/60 supports-[backdrop-filter]:via-cream-50/60 supports-[backdrop-filter]:to-primary-100/30">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 shrink-0 hover:text-primary-600 transition-all duration-300 ease-out rounded-xl px-2 py-1 -mx-2"
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold text-lg shadow-lg shadow-primary-500/30">
                <span className="relative z-10">S</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-warm-gray-900 to-warm-gray-700 bg-clip-text text-transparent hidden sm:block">
                ShopHub
              </span>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              {/* Search Icon */}
              <SearchIconButton />

              {/* Cart */}
              <button
                type="button"
                onClick={() => toggleCart(true)}
                className="relative p-2.5 text-warm-gray-600 hover:text-primary-600 transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl"
                aria-label="Open cart"
                suppressHydrationWarning
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span
                    className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-[10px] font-bold text-white shadow-lg shadow-primary-500/40 animate-pulse"
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
                    className="gap-2 bg-white border-2 border-warm-gray-300 text-warm-gray-700 hover:text-primary-600 hover:border-primary-500 transition-colors"
                    onClick={() => router.push("/profile?tab=dashboard")}
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">
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
                    className="hidden sm:flex bg-white border-2 border-warm-gray-300 text-warm-gray-700 hover:text-primary-600 hover:border-primary-500 transition-colors"
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
                    className="bg-white border-2 border-warm-gray-300 text-warm-gray-700 hover:text-primary-600 hover:border-primary-500 transition-colors"
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
                    className="hidden sm:flex"
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
