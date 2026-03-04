// Checkout page for shipping and payment steps.
"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Stack } from "@/components/ui/stack";
import { FormSection } from "@/components/ui/form-section";
import { Stepper } from "@/components/ui/stepper";
import { CardRadio } from "@/components/ui/card-radio";
import { Heading, Text } from "@/components/ui/typography";
import { BadgedSectionTitle } from "@/components/ui/SectionTitle";
import { CreditCard, Truck, ShoppingBag, ShieldCheck, CheckCircle2 } from "lucide-react";
import { AddressSelector, OrderSummaryCard } from "@/features/checkout";
import { CheckoutCardSection } from "@/features/checkout/components/CheckoutCardSection";
import { useCheckoutAddress } from "./hooks/useCheckoutAddress";
import { useCheckoutCoupon } from "./hooks/useCheckoutCoupon";
import { useCheckoutOrder } from "./hooks/useCheckoutOrder";
import type { CheckoutFormData } from "./types";
import { checkoutSchema } from "./schemas";
import { useCart } from "@/features/cart/hooks";
import { useAuthStore, selectAuthUser } from "@/store/auth-store";
import { useFormDraft } from "@/lib/forms/useFormDraft";
import { DEMO_CHECKOUT } from "@/lib/flags";
import { logger } from "@/lib/logger";
import { SkeletonBlock, SkeletonText } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

const steps = [
  { label: "Shopping Cart", href: "/cart", state: "done" as const },
  { label: "Checkout Details", state: "active" as const },
  { label: "Order Complete", state: "upcoming" as const },
];



export default function CheckoutPage() {
  const {
    items,
    subtotal,
    clearCart,
    shippingOption: cartShippingOption,
    isLoading,
    isAuthenticated,
  } = useCart();
  const user = useAuthStore(selectAuthUser);

  // Dev-only debug log for demo mode
  logger.debug("DEMO_CHECKOUT:", DEMO_CHECKOUT);


  const form = useForm<CheckoutFormData>({
    resolver: yupResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      country: "Lebanon",
      city: "",
      state: "",
      street1: "",
      postalCode: "",
      notes: "",
      shippingOption: cartShippingOption,
    },
  });

  const { register, handleSubmit, watch, formState, setValue, reset } = form;
  const { isSubmitting, errors } = formState;
  const shippingOption = watch("shippingOption");

  // Pre-fill email for logged-in users (form is single source of truth for confirmation email)
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setValue("email", user.email);
    }
  }, [isAuthenticated, user?.email, setValue]);

  // Draft loads first so default address can overwrite it; enabled when cart has items
  const { clearDraft } = useFormDraft(form, {
    key: "draft:checkout",
    storage: "session",
    enabled: !isLoading && items.length > 0,
  });

  // Address selection: auto-applies default address from profile to checkout fields
  const {
    addresses,
    selectedAddress,
    handleSelectAddress,
    handleUseForm,
  } = useCheckoutAddress({
    form,
    cartShippingOption,
    defaultEmail: user?.email ?? "",
  });

  // Extract coupon management logic to custom hook (requires subtotal for backend validation)
  const {
    couponCode,
    couponDiscount,
    couponError,
    isValidatingCoupon,
    handleApplyCoupon,
    handleRemoveCoupon,
  } = useCheckoutCoupon({
    subtotal,
    guestEmail: !isAuthenticated ? watch("email") || undefined : undefined,
  });

  const { onSubmit, isOrderPlaced } = useCheckoutOrder({
    items,
    couponDiscount,
    couponCode,
    clearCart,
    clearDraft,
  });

  const isEmpty = !isLoading && !isOrderPlaced && items.length === 0;

  // Loading skeleton for checkout form
  const CheckoutFormSkeleton = () => (
    <Stack spacing="xl">
      {/* Contact Information Skeleton */}
      <CheckoutCardSection title="Contact Information">
        <div className="grid gap-6 md:grid-cols-2">
          <SkeletonBlock className="h-10" />
          <SkeletonBlock className="h-10" />
          <div className="md:col-span-2">
            <SkeletonBlock className="h-10" />
          </div>
          <div className="md:col-span-2">
            <SkeletonBlock className="h-10" />
          </div>
        </div>
      </CheckoutCardSection>

      {/* Shipping Address Skeleton */}
      <CheckoutCardSection title="Shipping Address">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <SkeletonBlock className="h-10" />
            <SkeletonBlock className="h-10" />
          </div>
          <SkeletonBlock className="h-10" />
          <SkeletonBlock className="h-10" />
          <SkeletonBlock className="h-6 w-24" />
        </div>
      </CheckoutCardSection>

      {/* Order Notes Skeleton */}
      <CheckoutCardSection title="Order Notes" tone="subtle">
        <SkeletonBlock className="h-24" />
      </CheckoutCardSection>

      {/* Shipping Method Skeleton */}
      <CheckoutCardSection title="Shipping Method">
        <div className="space-y-3">
          <SkeletonBlock className="h-16" />
          <SkeletonBlock className="h-16" />
          <SkeletonBlock className="h-16" />
        </div>
      </CheckoutCardSection>
    </Stack>
  );

  // Show loading state
  if (isLoading) {
    return (
      <Section spacing="lg">
        <Container size="lg">
          <Stack spacing="xl" align="stretch">
            {/* Header & Stepper */}
            <Stack spacing="md" align="center">
              <SkeletonBlock className="h-8 w-48 mx-auto" />
              <SkeletonBlock className="h-4 w-64 mx-auto" />
              <div className="w-full max-w-md pt-4">
                <SkeletonBlock className="h-12 w-full" />
              </div>
            </Stack>

            <form className="grid gap-12 lg:grid-cols-[2fr_1fr]">
              {/* Main form content */}
              <CheckoutFormSkeleton />

              {/* Order summary skeleton */}
              <aside className="lg:sticky lg:top-6 h-fit">
                <Card className="shadow-sm">
                  <div className="p-6 space-y-8">
                    <SkeletonBlock className="h-6 w-32" />
                    <div className="space-y-4">
                      {Array.from({ length: 3 }, (_, i) => (
                        <div
                          key={i}
                          className="flex gap-4 p-4 rounded-lg bg-warm-gray-50/50"
                        >
                          <SkeletonBlock className="h-16 w-16" />
                          <div className="flex-1 space-y-2">
                            <SkeletonText lines={2} />
                            <SkeletonBlock className="h-6 w-16" />
                          </div>
                          <SkeletonBlock className="h-5 w-12" />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <SkeletonBlock className="h-6 w-24" />
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <SkeletonBlock className="h-4 w-16" />
                          <SkeletonBlock className="h-4 w-12" />
                        </div>
                        <div className="flex items-center justify-between">
                          <SkeletonBlock className="h-4 w-20" />
                          <SkeletonBlock className="h-4 w-8" />
                        </div>
                      </div>
                      <div className="pt-4 border-t border-warm-gray-200">
                        <div className="flex items-center justify-between">
                          <SkeletonBlock className="h-5 w-12" />
                          <SkeletonBlock className="h-6 w-16" />
                        </div>
                      </div>
                    </div>
                    <SkeletonBlock className="h-12 w-full" />
                  </div>
                </Card>
              </aside>
            </form>
          </Stack>
        </Container>
      </Section>
    );
  }

  if (isOrderPlaced) {
    const completedSteps = [
      { label: "Shopping Cart", href: "/cart", state: "done" as const },
      { label: "Checkout Details", state: "done" as const },
      { label: "Order Complete", state: "active" as const },
    ];

    return (
      <Section spacing="lg">
        <Container size="lg">
          <Stack spacing="xl" align="stretch">
            <Stack spacing="md" align="center">
              <div className="w-full max-w-2xl pt-4">
                <Stepper steps={completedSteps} showLabelsOnMobile />
              </div>
            </Stack>
            <Card className="p-12 text-center border-none shadow-xl shadow-warm-gray-100/50 bg-white/80 backdrop-blur-sm">
              <Stack spacing="lg" align="center">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20" />
                  <div className="relative w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                <Heading level="h3">Order Placed Successfully!</Heading>
                <Text className="text-warm-gray-600 max-w-sm">
                  Redirecting you to your order confirmation...
                </Text>
                <div className="flex items-center gap-2 text-warm-gray-400">
                  <div className="h-2 w-2 rounded-full bg-primary-500 animate-bounce [animation-delay:0ms]" />
                  <div className="h-2 w-2 rounded-full bg-primary-500 animate-bounce [animation-delay:150ms]" />
                  <div className="h-2 w-2 rounded-full bg-primary-500 animate-bounce [animation-delay:300ms]" />
                </div>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Section>
    );
  }

  return (
    <Section spacing="lg">
      <Container size="lg">
        <Stack spacing="xl" align="stretch">
          {/* Header & Stepper */}
          <Stack spacing="md" align="center">
            <BadgedSectionTitle
              badgeText="Final Step"
              title="Checkout"
              subtitle="Complete your order by filling in the details below"
              icon={CreditCard}
            />
            <div className="w-full max-w-2xl pt-4">
              <Stepper steps={steps} showLabelsOnMobile />
            </div>
          </Stack>

          {isEmpty ? (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <Heading level="h3">Your cart is empty</Heading>
                <Text className="text-warm-gray-600">
                  Add items to proceed to checkout.
                </Text>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link href="/products">
                    <Button className="rounded-lg px-8 w-full sm:w-auto">
                      Return to shop
                    </Button>
                  </Link>
                  <Link href="/cart">
                    <Button
                      variant="secondary"
                      className="rounded-lg px-8 w-full sm:w-auto"
                    >
                      Go to cart
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid gap-12 lg:grid-cols-[2fr_1fr]"
            >
              {/* Main form content */}
              <Stack spacing="xl">
                {/* Contact Information Section */}
                <CheckoutCardSection
                  title="Contact Information"
                  description="We'll use this to send you updates about your order"
                  icon={ShoppingBag}
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <Input
                      type="text"
                      label="First name *"
                      autoComplete="given-name"
                      {...register("firstName")}
                      error={!!errors.firstName}
                      errorMessage={errors.firstName?.message}
                      required
                      className="rounded-xl"
                    />
                    <Input
                      type="text"
                      label="Last name *"
                      autoComplete="family-name"
                      {...register("lastName")}
                      error={!!errors.lastName}
                      errorMessage={errors.lastName?.message}
                      required
                      className="rounded-xl"
                    />
                    <div className="md:col-span-2">
                      <Input
                        type="email"
                        label="Email address"
                        autoComplete="email"
                        {...register("email")}
                        error={!!errors.email}
                        errorMessage={errors.email?.message}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        type="tel"
                        label="Phone number *"
                        autoComplete="tel"
                        {...register("phone")}
                        error={!!errors.phone}
                        errorMessage={errors.phone?.message}
                        required
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </CheckoutCardSection>

                {/* Shipping Address Section */}
                <CheckoutCardSection
                  title="Shipping Address"
                  description="Where should we deliver your order?"
                  icon={Truck}
                >
                  {/* Address Selector - Show saved addresses if available */}
                  {addresses.length > 0 && (
                    <div className="mb-8">
                      <AddressSelector
                        selectedAddressId={selectedAddress?.id || null}
                        onSelectAddress={handleSelectAddress}
                        onUseForm={handleUseForm}
                      />
                    </div>
                  )}

                  {/* Address Form - Always show form, always editable */}
                  <div className="space-y-6">
                    {/* Country & City Row */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        type="text"
                        label="Country / Region *"
                        autoComplete="country-name"
                        {...register("country")}
                        error={!!errors.country}
                        errorMessage={errors.country?.message}
                        required
                        className="rounded-xl"
                      />
                      <Input
                        type="text"
                        label="City *"
                        autoComplete="address-level2"
                        {...register("city")}
                        error={!!errors.city}
                        errorMessage={errors.city?.message}
                        required
                        className="rounded-xl"
                      />
                    </div>

                    {/* District/State */}
                    <Input
                      type="text"
                      label="District / State"
                      autoComplete="address-level1"
                      placeholder="e.g., Beirut, Mount Lebanon"
                      {...register("state")}
                      className="rounded-xl"
                    />

                    {/* Street Address */}
                    <Input
                      type="text"
                      label="Street address *"
                      autoComplete="street-address"
                      placeholder="House number and street name"
                      {...register("street1")}
                      error={!!errors.street1}
                      errorMessage={errors.street1?.message}
                      required
                      className="rounded-xl"
                    />

                    {/* Postal Code */}
                    <div className="max-w-xs">
                      <Input
                        type="text"
                        label="Postal Code"
                        autoComplete="postal-code"
                        placeholder="Optional"
                        {...register("postalCode")}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </CheckoutCardSection>

                {/* Order Notes Section - Optional and visually de-emphasized */}
                <CheckoutCardSection
                  title="Order Notes"
                  description="Any special instructions for delivery?"
                  tone="subtle"
                  icon={ShieldCheck}
                >
                  <Textarea
                    {...register("notes")}
                    placeholder="Special delivery instructions, gate codes, or other notes..."
                    className="rounded-xl min-h-[120px] bg-white"
                  />
                </CheckoutCardSection>

                {/* Shipping Options Section */}
                <CheckoutCardSection
                  title="Shipping Method"
                  description="Choose how you'd like to receive your order"
                  icon={Truck}
                >
                  <CardRadio
                    name="shippingOption"
                    value={shippingOption}
                    onValueChange={(value) =>
                      setValue(
                        "shippingOption",
                        value as "pickup" | "beirut" | "outside",
                        {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        }
                      )
                    }
                    options={[
                      {
                        value: "pickup",
                        label: "Local pickup",
                        title: "Local pickup",
                        description: "Pick up your order from our store",
                        rightAlignedMeta: (
                          <span className="font-semibold text-warm-gray-900">
                            Free
                          </span>
                        ),
                      },
                      {
                        value: "beirut",
                        label: "Beirut delivery",
                        title: "Beirut delivery",
                        description: "Delivery within Beirut area",
                        rightAlignedMeta: (
                          <span className="font-semibold text-warm-gray-900">
                            Free
                          </span>
                        ),
                      },
                      {
                        value: "outside",
                        label: "Outside Beirut",
                        title: "Outside Beirut",
                        description: "Delivery outside Beirut area",
                        rightAlignedMeta: (
                          <span className="font-semibold text-warm-gray-900">
                            $5.00
                          </span>
                        ),
                      },
                    ]}
                  />
                </CheckoutCardSection>
              </Stack>

              {/* Order summary - sticky on desktop */}
              <aside className="lg:sticky lg:top-6 h-fit">
                <OrderSummaryCard
                  shippingOption={shippingOption}
                  isSubmitting={isSubmitting}
                  couponCode={couponCode}
                  couponDiscount={couponDiscount}
                  couponError={couponError}
                  isValidatingCoupon={isValidatingCoupon}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={handleRemoveCoupon}
                />
              </aside>
            </form>
          )}
        </Stack>
      </Container>
    </Section>
  );
}
