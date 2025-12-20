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
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={() => toggleCart(false)}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-600">
              Cart
            </p>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              <span className="text-lg font-bold text-gray-900">
                {totalItems} item{totalItems === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleCart(false)}
            className="rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-600">
              <ShoppingCart className="mb-3 h-10 w-10 text-gray-400" />
              <p className="font-semibold">Your cart is empty</p>
              <p className="text-sm text-gray-600">
                Add items to see them here.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.key}
                  className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
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
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2"
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

        <footer className="border-t bg-white px-5 py-4 shadow-inner">
          <div className="mb-3 flex items-center justify-between text-sm font-semibold text-gray-900">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal, { alwaysShowDecimals: true })}</span>
          </div>
          <div className="grid gap-2">
            <Link href="/cart" onClick={() => toggleCart(false)}>
              <Button
                variant="secondary"
                className="w-full rounded-full py-2 font-semibold"
              >
                View Cart
              </Button>
            </Link>
            <Link href="/checkout" onClick={() => toggleCart(false)}>
              <Button className="w-full rounded-full py-2 font-semibold">
                Checkout
              </Button>
            </Link>
            {items.length > 0 && (
              <Button
                variant="ghost"
                className="w-full rounded-full py-2 text-sm text-gray-600"
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
