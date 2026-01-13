// Sliding sidebar showing cart contents and totals.
"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  X,
  ShieldCheck,
  ArrowRight,
  Package,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "../hooks";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils/cn";

export function CartSidebar() {
  const {
    items,
    isOpen,
    toggleCart,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    totalItems,
  } = useCart();

  const formatOptionLabel = (key: string) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          toggleCart(false);
        }
      };
      document.addEventListener("keydown", handleEscape);

      return () => {
        document.body.style.overflow = original;
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen, toggleCart]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-modal-backdrop flex justify-end transition-opacity duration-500 ease-in-out",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Enhanced backdrop with premium blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-all duration-500"
        onClick={() => toggleCart(false)}
      />

      {/* Modern Floating Sidebar with Standard Small Radius */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className={cn(
          "relative flex h-full w-full flex-col bg-white/90 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.3)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          "md:m-4 md:h-[calc(100vh-2rem)] md:max-w-md md:rounded-xl md:border md:border-white/20",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header Section */}
        <header className="px-8 pt-8 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-600 text-white shadow-lg shadow-primary-600/20">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <h2 id="cart-title" className="text-xl font-bold text-gray-900">
                  Your Cart
                </h2>
                <p className="text-sm font-medium text-gray-500">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleCart(false)}
              className="group flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-all duration-200"
              aria-label="Close cart"
            >
              <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {/* Special Feature: Delivery Intelligence & Assurance */}
          {items.length > 0 && (
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-white border border-gray-100 text-primary-600 shadow-sm">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-900 uppercase tracking-tight">
                    Purchase Protection
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium leading-none mt-1">
                    2-Year Warranty Included
                  </p>
                </div>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-900 uppercase tracking-tight">
                  Est. Delivery
                </p>
                <p className="text-[10px] text-primary-600 font-bold mt-1">
                  Jan 14 — 15
                </p>
              </div>
            </div>
          )}
        </header>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-8 py-2 custom-scrollbar">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary-100 rounded-full blur-2xl opacity-50 animate-pulse-slow" />
                <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-xl border border-gray-50">
                  <Package className="h-10 w-10 text-primary-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-sm text-gray-500 max-w-[240px] mb-8 leading-relaxed">
                Looks like you haven&apos;t added anything to your cart yet.
              </p>
              <Link href="/products" onClick={() => toggleCart(false)}>
                <Button className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold tracking-[0.05em] uppercase rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                  Start Shopping
                </Button>
              </Link>

              <div className="mt-12 w-full pt-8 border-t border-gray-100">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                  Popular Categories
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["Electronics", "Apparel", "Home", "Accessories"].map((cat) => (
                    <Link
                      key={cat}
                      href={`/products?category=${cat.toLowerCase()}`}
                      onClick={() => toggleCart(false)}
                      className="px-3 py-1.5 rounded-lg bg-red-50 text-[10px] font-black uppercase tracking-widest text-red-600 border border-red-100 hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li
                  key={item.key}
                  className="group relative flex gap-5 p-1 transition-all duration-300"
                >
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100 group-hover:shadow-md transition-shadow">
                    <Image
                      src={item.image ?? ""}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                      sizes="96px"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between py-0.5">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.slug}`}
                          className="text-sm font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1"
                          onClick={() => toggleCart(false)}
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          className="p-1.5 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1">
                        {item.selectedOptions && Object.entries(item.selectedOptions).map(([key, value]) => (
                          <span key={key} className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-bold text-gray-600 uppercase tracking-tight">
                            {formatOptionLabel(key)}: {value}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center h-9 p-1 rounded-lg bg-gray-100 border border-gray-200">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="flex items-center justify-center w-7 h-7 rounded-md text-gray-500 hover:bg-red-600 hover:text-white hover:shadow-sm transition-all disabled:opacity-40"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className="flex items-center justify-center w-7 h-7 rounded-md text-gray-500 hover:bg-red-600 hover:text-white hover:shadow-sm transition-all"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer Section */}
        {items.length > 0 && (
          <footer className="px-8 py-8 bg-gray-50/50 md:rounded-b-xl border-t border-gray-100">
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
                <span>Subtotal</span>
                <span className="text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <span>Shipping</span>
                  <Info className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <span className="font-bold text-green-600">FREE</span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-xl font-black text-primary-600">
                  {formatPrice(subtotal)}
                </span>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/cart" onClick={() => toggleCart(false)} className="w-full">
                  <Button
                    variant="secondary"
                    className="w-full h-12 rounded-lg bg-white text-primary-600 hover:bg-primary-600 hover:text-white border border-warm-gray-200 hover:border-primary-600 font-bold tracking-[0.05em] uppercase shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    View Cart
                  </Button>
                </Link>
                <Link href="/checkout" onClick={() => toggleCart(false)} className="w-full">
                  <Button className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold tracking-[0.05em] uppercase rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    Checkout Now
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure Checkout
                </div>
                <div className="w-px h-3 bg-gray-200" />
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <Package className="h-3.5 w-3.5" />
                  Easy Returns
                </div>
              </div>
              <Button
                variant="ghost"
                className="mt-2 w-full h-8 text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-transparent"
                onClick={clearCart}
              >
                Empty Cart
              </Button>
            </div>
          </footer>
        )}
      </aside>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
