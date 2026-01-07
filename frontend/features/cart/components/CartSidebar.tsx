// Sliding sidebar showing cart contents and totals.
"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "../hooks";
import { formatPrice } from "@/lib/utils";

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

      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          toggleCart(false);
        }
      };
      document.addEventListener("keydown", handleEscape);

      // Focus management - focus the sidebar when opened
      const sidebar = document.querySelector('[role="dialog"]') as HTMLElement;
      if (sidebar) {
        sidebar.focus();
      }

      return () => {
        document.body.style.overflow = original;
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen, toggleCart]);

  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed inset-0 z-modal-backdrop transition-opacity duration-300 ease-out
        ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
    >
      {/* Enhanced backdrop with better visual separation */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ease-out"
        onClick={() => toggleCart(false)}
      />

      {/* Animated sidebar with proper z-index */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        aria-describedby="cart-description"
        tabIndex={-1}
        className={`
          absolute right-0 top-0 flex h-full flex-col
          bg-white/95 backdrop-blur-xl shadow-2xl z-modal
          transform transition-transform duration-300 ease-out
          w-full max-w-lg md:border-l md:border-gray-200/50
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <header className="flex items-center justify-between border-b border-gray-200/50 bg-white/80 backdrop-blur-sm px-6 py-5">
          <div>
            <p
              id="cart-title"
              className="text-xs font-semibold uppercase text-gray-500 tracking-wider"
            >
              Shopping Cart
            </p>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50">
                <ShoppingCart className="h-4 w-4 text-primary-600" />
              </div>
              <span
                id="cart-description"
                className="text-xl font-bold text-gray-900"
              >
                {totalItems} item{totalItems === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleCart(false)}
            className="flex items-center justify-center w-10 h-10 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 transition-colors duration-200"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <ShoppingCart className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-sm text-gray-600 max-w-xs">
                Add some products to your cart and they'll appear here.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.key}
                  className="flex gap-4 rounded-xl border border-gray-200/50 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-md bg-white">
                    <Image
                      src={item.image ?? ""}
                      alt={item.name}
                      fill
                      className="object-contain"
                      sizes="80px"
                    />
                  </div>

                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/products/${item.slug}`}
                          className="text-sm font-semibold text-gray-900 hover:text-primary-600"
                          onClick={() => toggleCart(false)}
                        >
                          {item.name}
                        </Link>
                        <div className="text-xs text-gray-600">
                          {(() => {
                            const optionSummary =
                              item.selectedOptions &&
                              Object.keys(item.selectedOptions).length > 0
                                ? Object.entries(item.selectedOptions)
                                    .map(
                                      ([key, value]) =>
                                        `${formatOptionLabel(key)}: ${value}`
                                    )
                                    .join(" • ")
                                : [
                                    item.color ? `Color: ${item.color}` : null,
                                    item.storage
                                      ? `Storage: ${item.storage}`
                                      : null,
                                  ]
                                    .filter(Boolean)
                                    .join(" • ");
                            return optionSummary;
                          })()}
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice(item.price, {
                            alwaysShowDecimals: true,
                          })}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-gray-200 bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.key, item.quantity - 1)
                          }
                          className="px-2 py-1 text-gray-600 hover:text-primary-600 disabled:opacity-40"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.key, item.quantity + 1)
                          }
                          className="px-2 py-1 text-gray-600 hover:text-primary-600"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="ml-auto text-sm font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity, {
                          alwaysShowDecimals: true,
                        })}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-gray-200/50 bg-white/90 backdrop-blur-sm px-6 py-3">
          {items.length > 0 && (
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">
                Subtotal
              </span>
              <span className="text-base font-bold text-gray-900">
                {formatPrice(subtotal, { alwaysShowDecimals: true })}
              </span>
            </div>
          )}
          <div className="grid gap-1.5">
            {items.length > 0 && (
              <Link href="/cart" onClick={() => toggleCart(false)}>
                <Button
                  variant="secondary"
                  className="w-full rounded-full py-2 font-semibold text-sm h-9 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                >
                  View Cart
                </Button>
              </Link>
            )}
            {items.length > 0 ? (
              <Link href="/checkout" onClick={() => toggleCart(false)}>
                <Button className="w-full rounded-full py-2 font-semibold text-sm h-9 bg-primary-600 hover:bg-primary-700 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]">
                  Proceed to Checkout
                </Button>
              </Link>
            ) : (
              <Link href="/products" onClick={() => toggleCart(false)}>
                <Button className="w-full rounded-full py-2 font-semibold text-sm h-9 bg-primary-600 hover:bg-primary-700 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]">
                  Shop Now
                </Button>
              </Link>
            )}
            {items.length > 0 && (
              <Button
                variant="ghost"
                className="w-full rounded-full py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 h-7"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            )}
          </div>
        </footer>
      </aside>
    </div>
  );
}
