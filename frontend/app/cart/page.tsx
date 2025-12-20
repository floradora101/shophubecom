// Shopping cart page for reviewing items.
"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/hooks";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";

const steps = [
  { label: "Shopping Cart", active: true, completed: false },
  { label: "Checkout Details", active: false, completed: false },
  { label: "Order Complete", active: false, completed: false },
];

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const [shippingOption, setShippingOption] = useState<
    "pickup" | "beirut" | "outside"
  >("pickup");
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shippingCost =
    shippingOption === "pickup" ? 0 : shippingOption === "beirut" ? 3 : 5;
  const total = subtotal + shippingCost;
  const formatOptionLabel = (key: string) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 bg-white py-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Step indicator */}
          <div className="mb-6 hidden flex-wrap items-center justify-center gap-3 text-sm font-semibold text-gray-700 text-center sm:flex">
            {steps.map((step, idx) => {
              const stepUrls = ["/cart", "/checkout", ""];
              const stepUrl = stepUrls[idx];
              const isClickable = stepUrl && idx < 2; // Only first 2 steps are clickable

              const stepContent = (
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                      step.active
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-300 bg-white text-gray-600"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className={`transition-colors ${
                      step.active ? "text-primary-700" : "text-gray-600"
                    }`}
                  >
                    {step.label}
                  </span>
                  {idx < steps.length - 1 && (
                    <span className="mx-2 text-gray-300">—</span>
                  )}
                </div>
              );

              return isClickable ? (
                <Link
                  key={step.label}
                  href={stepUrl}
                  className="hover:opacity-80 transition-opacity"
                >
                  {stepContent}
                </Link>
              ) : (
                <div key={step.label}>{stepContent}</div>
              );
            })}
          </div>

          {items.length > 0 && (
            <div className="mb-2 flex justify-end">
              <Button variant="ghost" onClick={clearCart}>
                Clear cart
              </Button>
            </div>
          )}

          {items.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <p className="text-lg font-semibold text-gray-800">
                Your cart is currently empty.
              </p>
              <p className="text-sm text-gray-600">
                Return to the shop to add products.
              </p>
              <Link href="/products" className="mt-5 inline-block">
                <Button className="rounded-full px-6">Return to shop</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div className="rounded-lg border border-gray-200 bg-white">
                <div className="hidden border-b px-6 py-3 text-xs font-semibold uppercase text-gray-600 md:grid md:grid-cols-[2fr_repeat(3,1fr)]">
                  <span>Product</span>
                  <span className="text-center">Price</span>
                  <span className="text-center">Quantity</span>
                  <span className="text-center">Subtotal</span>
                </div>

                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div
                      key={item.key}
                      className="grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[2fr_repeat(3,1fr)] md:items-center"
                    >
                      <div className="flex gap-4">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                          <Image
                            src={item.image ?? ""}
                            alt={item.name}
                            fill
                            sizes="96px"
                            className="object-contain"
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-between gap-2">
                          <div>
                            <Link
                              href={`/products/${item.slug}`}
                              className="text-base font-semibold text-gray-900 hover:text-primary-600"
                            >
                              {item.name}
                            </Link>
                            <p className="text-sm text-gray-600">
                              {(() => {
                                const optionSummary =
                                  item.selectedOptions &&
                                  Object.keys(item.selectedOptions).length > 0
                                    ? Object.entries(item.selectedOptions)
                                        .map(
                                          ([key, value]) =>
                                            `${formatOptionLabel(
                                              key
                                            )}: ${value}`
                                        )
                                        .join(" • ")
                                    : [
                                        item.color
                                          ? `Color: ${item.color}`
                                          : null,
                                        item.storage
                                          ? `Storage: ${item.storage}`
                                          : null,
                                      ]
                                        .filter(Boolean)
                                        .join(" • ");
                                return optionSummary;
                              })()}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.key)}
                            className="w-max rounded-full px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                          >
                            <span className="inline-flex items-center gap-1">
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="hidden text-center text-sm font-semibold text-gray-900 md:block">
                        {formatPrice(item.price, { alwaysShowDecimals: true })}
                      </div>

                      <div className="flex items-center justify-start md:justify-center">
                        <div className="inline-flex items-center rounded-full border border-gray-200 bg-white">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.key, item.quantity - 1)
                            }
                            className="px-3 py-2 text-gray-600 hover:text-primary-600 disabled:opacity-40"
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-12 text-center text-sm font-semibold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.key, item.quantity + 1)
                            }
                            className="px-3 py-2 text-gray-600 hover:text-primary-600"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="text-left text-base font-semibold text-gray-900 md:text-center">
                        {formatPrice(item.price * item.quantity, {
                          alwaysShowDecimals: true,
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="text-base font-semibold uppercase text-gray-800">
                  Cart totals
                </h2>
                <div className="mt-4 space-y-3 text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span className="text-base font-semibold">
                      {formatPrice(subtotal, { alwaysShowDecimals: true })}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-900">
                      Shipping
                    </p>
                    <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping"
                          value="pickup"
                          checked={shippingOption === "pickup"}
                          onChange={() => setShippingOption("pickup")}
                          className="h-4 w-4 accent-primary-600"
                        />
                        <span className="flex-1">Local pickup</span>
                        <span className="font-semibold">$0</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping"
                          value="beirut"
                          checked={shippingOption === "beirut"}
                          onChange={() => setShippingOption("beirut")}
                          className="h-4 w-4 accent-primary-600"
                        />
                        <span className="flex-1">Beirut</span>
                        <span className="font-semibold">$3</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping"
                          value="outside"
                          checked={shippingOption === "outside"}
                          onChange={() => setShippingOption("outside")}
                          className="h-4 w-4 accent-primary-600"
                        />
                        <span className="flex-1">Outside Beirut</span>
                        <span className="font-semibold">$5</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-600">
                      Shipping options will be confirmed during checkout.
                    </p>
                    <button
                      type="button"
                      className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                    >
                      Calculate shipping
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Taxes and shipping are calculated at checkout.
                  </p>
                  <div className="flex items-center justify-between pt-2 text-base font-semibold text-gray-900">
                    <span>Total</span>
                    <span>
                      {formatPrice(total, { alwaysShowDecimals: true })}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  <Link href="/checkout">
                    <Button className="w-full rounded-full">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button variant="secondary" className="w-full rounded-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
