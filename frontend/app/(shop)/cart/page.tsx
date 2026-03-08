// Shopping cart page for reviewing items.
// Backend-required: cart is server-owned (guest + user sessions).
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/hooks";
import { formatPrice } from "@/lib/utils";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { BadgedSectionTitle } from "@/components/ui/SectionTitle";
import { Stepper, type Step } from "@/components/ui/stepper";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Stack } from "@/components/ui/stack";
import { Badge } from "@/components/ui/badge";
import { productRoutes } from "@/lib/routes";
import { ErrorState } from "@/components/ui/error-state";
import { extractErrorMessage } from "@/lib/api/error-handler";
import { USE_MOCKS } from "@/lib/flags";

const steps: Step[] = [
  { label: "Shopping Cart", state: "active" as const },
  { label: "Checkout Details", href: "/checkout", state: "upcoming" as const },
  { label: "Order Complete", state: "upcoming" as const },
];

// Loading skeleton for cart items
const CartLoadingSkeleton = () => (
  <Stack spacing="md">
    <div className="flex items-center justify-between px-2">
      <SkeletonBlock className="h-6 w-32" />
      <SkeletonBlock className="h-6 w-20" />
    </div>
    <div className="space-y-4">
      {Array.from({ length: 3 }, (_, i) => (
        <Card key={i} className="p-5">
          <div className="flex gap-5">
            <SkeletonBlock className="h-32 w-32 rounded-xl shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="flex justify-between">
                <SkeletonBlock className="h-6 w-1/2" />
                <SkeletonBlock className="h-6 w-20" />
              </div>
              <div className="flex gap-2">
                <SkeletonBlock className="h-6 w-24 rounded-lg" />
                <SkeletonBlock className="h-6 w-24 rounded-lg" />
              </div>
              <div className="flex justify-between items-center mt-auto">
                <SkeletonBlock className="h-10 w-28 rounded-xl" />
                <SkeletonBlock className="h-6 w-20" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </Stack>
);

// Loading skeleton for cart summary
const CartSummarySkeleton = () => (
  <Card className="p-8 space-y-6">
    <SkeletonBlock className="h-7 w-40" />
    <div className="space-y-4">
      <div className="flex justify-between">
        <SkeletonBlock className="h-5 w-20" />
        <SkeletonBlock className="h-5 w-16" />
      </div>
      <div className="space-y-2 pt-4">
        <SkeletonBlock className="h-5 w-32" />
        <div className="space-y-2">
          <SkeletonBlock className="h-12 w-full rounded-xl" />
          <SkeletonBlock className="h-12 w-full rounded-xl" />
          <SkeletonBlock className="h-12 w-full rounded-xl" />
        </div>
      </div>
      <div className="pt-6 border-t border-warm-gray-100 flex justify-between">
        <SkeletonBlock className="h-6 w-16" />
        <SkeletonBlock className="h-8 w-24" />
      </div>
      <div className="pt-6 space-y-3">
        <SkeletonBlock className="h-14 w-full rounded-full" />
        <SkeletonBlock className="h-12 w-full rounded-full" />
      </div>
    </div>
  </Card>
);

export default function CartPage() {
  const {
    items,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
    shippingOption,
    setShippingOption,
    isLoading,
    isError,
    error,
    refetch,
  } = useCart();
  const shippingCost =
    shippingOption === "pickup" ? 0 : shippingOption === "beirut" ? 0 : 5;
  const total = subtotal + shippingCost;

  const formatOptionLabel = (key: string) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  if (USE_MOCKS) {
    return (
      <Section spacing="lg">
        <Container>
          <Card className="p-10 text-center border-dashed">
            <div className="mx-auto w-20 h-20 bg-warm-gray-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="h-10 w-10 text-warm-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-fg mb-2">
              Cart requires backend
            </h2>
            <p className="text-muted-fg max-w-sm mx-auto">
              Shopping cart is server-backed. Disable mock mode to use cart and checkout.
            </p>
          </Card>
        </Container>
      </Section>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <Section spacing="lg">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <CartLoadingSkeleton />
            <CartSummarySkeleton />
          </div>
        </Container>
      </Section>
    );
  }

  // Show error state
  if (isError) {
    return (
      <Section spacing="lg">
        <Container>
          <ErrorState
            title="Unable to Load Cart"
            description={extractErrorMessage(error, "We couldn't load your cart. This might be due to a temporary issue.")}
            onRetry={() => refetch()}
            retryText="Try Again"
          />
        </Container>
      </Section>
    );
  }

  return (
    <Section spacing="lg">
      <Container>
        <Stack spacing="xl">
          {/* Header & Stepper */}
          <Stack spacing="md" align="center">
            <BadgedSectionTitle
              badgeText="Your Selection"
              title="Shopping Cart"
              subtitle="Review your items before proceeding to checkout"
              icon={ShoppingBag}
            />
            <div className="w-full max-w-2xl pt-4">
              <Stepper steps={steps} showLabelsOnMobile />
            </div>
          </Stack>

          {!isLoading && items.length === 0 ? (
            <Card className="p-16 text-center border-dashed">
              <div className="mx-auto w-20 h-20 bg-warm-gray-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="h-10 w-10 text-warm-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-fg mb-2">
                Your cart is currently empty
              </h2>
              <p className="text-muted-fg mb-8 max-w-sm mx-auto">
                Looks like you haven&apos;t added anything to your cart yet.
              </p>
              <Link href="/products">
                <Button size="lg" className="rounded-lg px-8 gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Return to shop
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
              {/* Cart Items List */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-lg font-bold text-fg">
                    Items ({items.length})
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-muted-fg hover:text-red-600 hover:bg-red-50"
                  >
                    Clear cart
                  </Button>
                </div>

                <div className="space-y-4">
                  {items.map((item) => (
                    <Card
                      key={item.key}
                      className="group overflow-hidden border-warm-gray-200 hover:border-primary-200 transition-all duration-300 hover:shadow-md"
                    >
                      <div className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row gap-5">
                          {/* Image Container */}
                          <div className="relative h-32 w-full sm:w-32 shrink-0 overflow-hidden rounded-xl border border-warm-gray-100 bg-warm-gray-50 group-hover:bg-white transition-colors">
                            <Image
                              src={item.image ?? ""}
                              alt={item.name}
                              fill
                              sizes="(max-width: 640px) 100vw, 128px"
                              className="object-contain p-2"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex flex-1 flex-col justify-between py-1">
                            <div className="space-y-1">
                              <div className="flex justify-between items-start gap-4">
                                <Link
                                  href={productRoutes.detail(item.slug)}
                                  className="text-lg font-bold text-fg hover:text-primary-600 transition-colors line-clamp-1"
                                >
                                  {item.name}
                                </Link>
                                <span className="text-lg font-black text-fg whitespace-nowrap">
                                  {formatPrice(item.price * item.quantity)}
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-2 mt-2">
                                {(() => {
                                  const options: Array<[string, string]> =
                                    item.selectedOptions &&
                                    Object.keys(item.selectedOptions).length > 0
                                      ? Object.entries(item.selectedOptions) as Array<[string, string]>
                                      : [
                                          item.color
                                            ? (["Color", item.color] as [string, string])
                                            : null,
                                          item.storage
                                            ? (["Storage", item.storage] as [string, string])
                                            : null,
                                        ].filter((item): item is [string, string] => item !== null);

                                  return options.map(([key, value]) => (
                                    <Badge
                                      key={key}
                                      variant="secondary"
                                      size="sm"
                                      className="bg-warm-gray-50 text-warm-gray-600 border-warm-gray-200 lowercase tracking-normal font-medium"
                                    >
                                      {formatOptionLabel(key as string)}:{" "}
                                      {value}
                                    </Badge>
                                  ));
                                })()}
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-6">
                              {/* Quantity Selector */}
                              <div
                                className="inline-flex items-center rounded-xl border border-warm-gray-200 bg-white shadow-sm overflow-hidden"
                                role="group"
                                aria-label={`Quantity for ${item.name}`}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(item.key, item.quantity - 1)
                                  }
                                  className="px-3 py-2 text-muted-fg hover:text-red-600 hover:bg-red-50 disabled:opacity-40 transition-all"
                                  disabled={item.quantity <= 1}
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span
                                  className="w-10 text-center text-sm font-bold text-fg border-x border-warm-gray-100 py-2 bg-warm-gray-50/30"
                                  aria-live="polite"
                                  aria-atomic="true"
                                >
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(item.key, item.quantity + 1)
                                  }
                                  className="px-3 py-2 text-muted-fg hover:text-red-600 hover:bg-red-50 transition-all"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeItem(item.key)}
                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-widest text-muted-fg hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Cart Summary */}
              <aside className="lg:sticky lg:top-8 h-fit">
                <Card className="p-6 sm:p-8 bg-white border-warm-gray-200 shadow-xl shadow-warm-gray-100/50">
                  <h3 className="text-xl font-bold text-fg mb-6 flex items-center gap-2">
                    Order Summary
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-muted-fg">
                      <span className="text-sm font-medium">Subtotal</span>
                      <span className="text-base font-bold text-fg">
                        {formatPrice(subtotal)}
                      </span>
                    </div>

                    <div className="pt-4 space-y-3">
                      <p className="text-sm font-bold text-fg flex items-center gap-2">
                        Shipping Method
                      </p>
                      <div className="grid gap-2">
                        {[
                          { id: "pickup", label: "Local Pickup", price: 0 },
                          { id: "beirut", label: "Beirut Delivery", price: 0 },
                          { id: "outside", label: "Outside Beirut", price: 5 },
                        ].map((option) => (
                          <label
                            key={option.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                              shippingOption === option.id
                                ? "border-primary-500 bg-primary-50 ring-1 ring-primary-500/20 shadow-sm"
                                : "border-warm-gray-100 hover:border-warm-gray-300 bg-warm-gray-50/30"
                            }`}
                          >
                            <div className="relative flex items-center justify-center">
                              <input
                                type="radio"
                                name="shipping"
                                value={option.id}
                                checked={shippingOption === option.id}
                                onChange={() =>
                                  setShippingOption(
                                    option.id as "pickup" | "beirut" | "outside"
                                  )
                                }
                                className="peer h-4 w-4 appearance-none rounded-full border border-warm-gray-300 checked:border-primary-500 transition-all"
                              />
                              <div className="absolute h-2 w-2 rounded-full bg-primary-500 opacity-0 peer-checked:opacity-100 transition-opacity" />
                            </div>
                            <span
                              className={`flex-1 text-sm font-medium ${
                                shippingOption === option.id
                                  ? "text-primary-700"
                                  : "text-muted-fg"
                              }`}
                            >
                              {option.label}
                            </span>
                            <span
                              className={`text-sm font-bold ${
                                shippingOption === option.id
                                  ? "text-primary-700"
                                  : "text-fg"
                              }`}
                            >
                              {option.price === 0
                                ? "Free"
                                : formatPrice(option.price)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-warm-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-fg">Total</span>
                        <div className="text-right">
                          <span className="text-2xl font-black text-primary-600 block">
                            {formatPrice(total)}
                          </span>
                          <span className="text-[10px] text-muted-fg uppercase tracking-widest font-bold">
                            Taxes included
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 grid gap-3">
                      <Link href="/checkout">
                        <Button
                          className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold tracking-[0.05em] uppercase rounded-lg shadow-sm hover:shadow-md transition-all duration-300 gap-2"
                          variant="default"
                        >
                          Proceed to Checkout
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </Link>
                      <Link href="/products">
                        <Button
                          variant="secondary"
                          className="w-full h-12 rounded-lg bg-white text-primary-600 hover:bg-primary-600 hover:text-white border border-warm-gray-200 hover:border-primary-600 font-bold tracking-[0.05em] uppercase shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          Continue Shopping
                        </Button>
                      </Link>
                    </div>

                    <div className="mt-4 p-4 rounded-xl bg-primary-50/50 border border-primary-100 flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center shrink-0 mt-0.5">
                        <ShoppingBag className="w-3 h-3 text-primary-600" />
                      </div>
                      <p className="text-[11px] text-primary-700 leading-relaxed font-medium">
                        Shop with confidence. Secure checkout and 30-day
                        money-back guarantee.
                      </p>
                    </div>
                  </div>
                </Card>
              </aside>
            </div>
          )}
        </Stack>
      </Container>
    </Section>
  );
}
