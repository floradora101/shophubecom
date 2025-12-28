// Checkout page for shipping and payment steps.
"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
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
import { AddressSelector, OrderSummaryCard } from "@/features/checkout";
import { useCart } from "@/features/cart/hooks";
import { apiClient } from "@/lib/api/client";
import { cartKeys } from "@/features/cart/query-keys";
import { useFormDraft } from "@/lib/forms/useFormDraft";
import { useAddressesQuery } from "@/features/addresses/queries";
import { extractErrorMessage } from "@/lib/utils/error-handler";
import { DEMO_CHECKOUT } from "@/lib/flags";
import { createDemoOrder } from "@/features/orders/demo/demoOrders";
import type { Address } from "@/features/addresses/api";

const steps = [
  { label: "Shopping Cart", href: "/cart", state: "done" as const },
  { label: "Checkout Details", state: "active" as const },
  { label: "Order Complete", state: "upcoming" as const },
];

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  country: string;
  city: string;
  state?: string;
  street1: string;
  postalCode: string;
  notes?: string;
  shippingOption: "pickup" | "beirut" | "outside";
}

// Wrapper component to reduce repetition of Card + FormSection pattern
function CheckoutCardSection({
  title,
  description,
  children,
  tone,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  tone?: "default" | "subtle";
}) {
  return (
    <Card
      variant={tone === "subtle" ? "default" : "bordered"}
      className={
        tone === "subtle"
          ? "border-warm-gray-200 bg-warm-gray-50/30"
          : undefined
      }
    >
      <FormSection title={title} description={description} className="p-6">
        {children}
      </FormSection>
    </Card>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { items, clearCart } = useCart();
  const isEmpty = items.length === 0;

  // Dev-only debug log for demo mode
  if (process.env.NODE_ENV === "development") {
    console.log("DEMO_CHECKOUT:", DEMO_CHECKOUT);
  }
  const { data: addresses = [] } = useAddressesQuery();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  // Auto-select default address if available
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    }
  }, [addresses, selectedAddress]);

  const form = useForm<CheckoutFormData>({
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
      shippingOption: "pickup",
    },
  });

  const { register, handleSubmit, watch, formState, setValue, reset } = form;
  const { isSubmitting } = formState;
  const shippingOption = watch("shippingOption");

  // Pre-fill form when address is selected
  useEffect(() => {
    if (selectedAddress) {
      // Split name into first and last name
      const nameParts = selectedAddress.name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setValue("firstName", firstName);
      setValue("lastName", lastName || firstName); // Fallback to full name if no last name
      setValue("phone", selectedAddress.phone || "");
      setValue("country", selectedAddress.country || "Lebanon");
      setValue("city", selectedAddress.city);
      setValue("state", selectedAddress.state || "");
      setValue("street1", selectedAddress.street); // Backend returns 'street', map to 'street1' for form
      setValue("postalCode", selectedAddress.zipCode || ""); // Backend returns 'zipCode', map to 'postalCode' for form
    }
  }, [selectedAddress, setValue]);

  // Handle address selection
  const handleSelectAddress = (address: Address | null) => {
    setSelectedAddress(address);
    if (!address) {
      // Reset form when "Use new address" is selected
      reset({
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
        shippingOption: "pickup",
      });
    } else {
      // Pre-fill form immediately when address is selected
      const nameParts = address.name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setValue("firstName", firstName);
      setValue("lastName", lastName || firstName);
      setValue("phone", address.phone || "");
      setValue("country", address.country || "Lebanon");
      setValue("city", address.city);
      setValue("state", address.state || "");
      setValue("street1", address.street);
      setValue("postalCode", address.zipCode || "");
    }
  };

  // Handle clearing selected address to use form
  const handleUseForm = () => {
    setSelectedAddress(null);
    reset({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      country: "Lebanon",
      city: "",
      street1: "",
      postalCode: "",
      notes: "",
      shippingOption: "pickup",
    });
  };

  // Enable draft persistence when cart is loaded (not empty)
  const { clearDraft } = useFormDraft(form, {
    key: "draft:checkout",
    storage: "session",
    enabled: !isEmpty,
  });

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      // Always use form data (user can edit even if address was selected)
      const shippingAddress = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email || undefined,
        country: data.country,
        city: data.city,
        state: data.state || undefined,
        street1: data.street1,
        postalCode: data.postalCode,
        notes: data.notes || undefined,
      };

      if (DEMO_CHECKOUT) {
        // Demo checkout mode - create order client-side
        if (process.env.NODE_ENV === "development") {
          console.log("Using demo checkout mode");
        }

        const shippingCost =
          data.shippingOption === "pickup"
            ? 0
            : data.shippingOption === "beirut"
            ? 3
            : 5;
        const subtotal = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const total = subtotal + shippingCost;

        const demoOrderItems = items.map((item) => ({
          id: item.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.price,
          total: item.price * item.quantity,
          title: item.name,
          attributes: null,
          variant:
            item.variantId && item.variantSku
              ? {
                  id: item.variantId,
                  sku: item.variantSku,
                  image: item.image,
                  options: item.selectedOptions
                    ? Object.entries(item.selectedOptions).map(
                        ([name, value]) => ({ name, value })
                      )
                    : undefined,
                }
              : undefined,
          product: {
            id: item.productId,
            name: item.name,
            slug: item.slug,
            images: [item.image],
          },
        }));

        const order = createDemoOrder({
          items: demoOrderItems,
          subtotal,
          shippingOption: data.shippingOption,
          shippingCost,
          total,
          shippingAddress,
        });

        // Clear draft on successful order
        clearDraft();

        // Clear cart client-side
        await clearCart();

        // Redirect to order complete page with demo flag
        router.replace(`/order-complete/${order.id}?demo=1`);
        return;
      }

      // Original backend flow
      const response = await apiClient.post("/checkout/place-order", {
        shippingOption: data.shippingOption,
        shippingAddress,
      });

      // Clear draft on successful order
      clearDraft();

      // Invalidate cart query cache since backend cleared the cart
      queryClient.invalidateQueries({ queryKey: cartKeys.all });

      // Redirect to order complete page
      // Backend wraps response in { success: true, data: { orderId, ... } }
      // For guest orders, token is automatically set in httpOnly cookie by backend
      const orderData = response.data?.data || response.data;
      const orderId = orderData?.orderId;

      if (!orderId) {
        toast.error(
          "Order placed successfully, but order ID is missing. Please contact support."
        );
        return;
      }

      // Redirect to order complete page (token is in httpOnly cookie)
      const redirectUrl = `/order-complete/${orderId}`;
      // Use replace instead of push to prevent back navigation to checkout
      router.replace(redirectUrl);
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(error, "Failed to place order. Please try again.")
      );
    }
  };

  return (
    <Section spacing="lg">
      <Container size="lg">
        <Stack spacing="xl" align="stretch">
          {/* Header */}
          <div className="text-center space-y-2">
            <Heading level="h2">Checkout</Heading>
            <Text className="text-warm-gray-600 max-w-md mx-auto">
              Complete your order by filling in the details below
            </Text>
          </div>

          {/* Stepper - hidden on mobile for cleaner layout */}
          <div className="hidden sm:block py-4">
            <Stepper steps={steps} />
          </div>

          {isEmpty ? (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <Heading level="h3">Your cart is empty</Heading>
                <Text className="text-warm-gray-600">
                  Add items to proceed to checkout.
                </Text>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link href="/products">
                    <Button className="rounded-full px-8 w-full sm:w-auto">
                      Return to shop
                    </Button>
                  </Link>
                  <Link href="/cart">
                    <Button
                      variant="secondary"
                      className="rounded-full px-8 w-full sm:w-auto"
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
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <Input
                      type="text"
                      label="First name *"
                      autoComplete="given-name"
                      {...register("firstName", { required: true })}
                      required
                    />
                    <Input
                      type="text"
                      label="Last name *"
                      autoComplete="family-name"
                      {...register("lastName", { required: true })}
                      required
                    />
                    <div className="md:col-span-2">
                      <Input
                        type="email"
                        label="Email address"
                        autoComplete="email"
                        {...register("email")}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        type="tel"
                        label="Phone number *"
                        autoComplete="tel"
                        {...register("phone", { required: true })}
                        required
                      />
                    </div>
                  </div>
                </CheckoutCardSection>

                {/* Shipping Address Section */}
                <CheckoutCardSection
                  title="Shipping Address"
                  description="Where should we deliver your order?"
                >
                  {/* Address Selector - Show saved addresses if available */}
                  {addresses.length > 0 && (
                    <div className="mb-6">
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
                        {...register("country", { required: true })}
                        required
                      />
                      <Input
                        type="text"
                        label="City *"
                        autoComplete="address-level2"
                        {...register("city", { required: true })}
                        required
                      />
                    </div>

                    {/* District/State */}
                    <Input
                      type="text"
                      label="District / State"
                      autoComplete="address-level1"
                      placeholder="e.g., Beirut, Mount Lebanon"
                      {...register("state")}
                    />

                    {/* Street Address */}
                    <Input
                      type="text"
                      label="Street address *"
                      autoComplete="street-address"
                      placeholder="House number and street name"
                      {...register("street1", { required: true })}
                      required
                    />

                    {/* Postal Code */}
                    <div className="max-w-xs">
                      <Input
                        type="text"
                        label="Postal Code"
                        autoComplete="postal-code"
                        placeholder="Optional"
                        {...register("postalCode")}
                      />
                    </div>
                  </div>
                </CheckoutCardSection>

                {/* Order Notes Section - Optional and visually de-emphasized */}
                <CheckoutCardSection
                  title="Order Notes"
                  description="Any special instructions for delivery?"
                  tone="subtle"
                >
                  <Textarea
                    {...register("notes")}
                    placeholder="Special delivery instructions, gate codes, or other notes..."
                  />
                </CheckoutCardSection>

                {/* Shipping Options Section */}
                <CheckoutCardSection
                  title="Shipping Method"
                  description="Choose how you'd like to receive your order"
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
                            $3.00
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
                />
              </aside>
            </form>
          )}
        </Stack>
      </Container>
    </Section>
  );
}
