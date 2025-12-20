// Checkout page for shipping and payment steps.
"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddressSelector } from "@/features/checkout/components/AddressSelector";
import { useCart } from "@/features/cart/hooks";
import { apiClient } from "@/lib/api/client";
import { cartKeys } from "@/features/cart/query-keys";
import { useFormDraft } from "@/lib/forms/useFormDraft";
import { useAddressesQuery } from "@/features/addresses/queries";
import { extractErrorMessage } from "@/lib/utils/error-handler";
import { formatPrice } from "@/lib/utils";
import type { Address } from "@/features/addresses/api";

const steps = [
  { label: "Shopping Cart", active: false, completed: false },
  { label: "Checkout Details", active: true, completed: false },
  { label: "Order Complete", active: false, completed: false },
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

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { items, subtotal } = useCart();
  const isEmpty = items.length === 0;
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

  const shippingCost =
    shippingOption === "pickup" ? 0 : shippingOption === "beirut" ? 3 : 5;
  const total = subtotal + shippingCost;

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
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 bg-white py-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Steps: hide on mobile for cleaner layout */}
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

          {isEmpty ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
              <p className="text-lg font-semibold text-gray-800">
                Your cart is empty.
              </p>
              <p className="text-sm text-gray-600">
                Add items to proceed to checkout.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link href="/products">
                  <Button className="rounded-full px-6">Return to shop</Button>
                </Link>
                <Link href="/cart">
                  <Button variant="secondary" className="rounded-full px-6">
                    Go to cart
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                {/* Billing details */}
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                  <h2 className="text-base font-semibold uppercase text-gray-800 mb-4">
                    Shipping Address
                  </h2>

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
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Input
                      type="text"
                      label="First name *"
                      {...register("firstName", { required: true })}
                      required
                    />
                    <Input
                      type="text"
                      label="Last name *"
                      {...register("lastName", { required: true })}
                      required
                    />
                    <Input
                      type="tel"
                      label="Phone *"
                      {...register("phone", { required: true })}
                      required
                    />
                    <Input
                      type="email"
                      label="Email address"
                      {...register("email")}
                    />
                    <Input
                      type="text"
                      label="Country / Region *"
                      {...register("country", { required: true })}
                      required
                    />
                    <Input
                      type="text"
                      label="City *"
                      {...register("city", { required: true })}
                      required
                    />
                    <Input
                      type="text"
                      label="District / State"
                      placeholder="e.g., Beirut, Mount Lebanon"
                      {...register("state")}
                    />
                    <div className="md:col-span-2">
                      <Input
                        type="text"
                        label="Street address *"
                        placeholder="House number and street name"
                        {...register("street1", { required: true })}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        type="text"
                        label="Postal Code"
                        placeholder="Optional"
                        {...register("postalCode")}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-sm font-semibold text-gray-800">
                        Order notes (optional)
                      </label>
                      <textarea
                        rows={3}
                        {...register("notes")}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                        placeholder="Notes about your order, e.g. special delivery instructions."
                      />
                    </div>
                  </div>
                </div>

                {/* Order summary */}
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                  <h2 className="text-base font-semibold uppercase text-gray-800">
                    Your order
                  </h2>
                  <div className="mt-4 space-y-3 text-sm text-gray-700">
                    <div className="flex items-center justify-between font-semibold text-gray-900">
                      <span>Product</span>
                      <span>Subtotal</span>
                    </div>
                    <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                      {items.map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between px-3 py-2 text-sm"
                        >
                          <span className="text-gray-800">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatPrice(item.price * item.quantity, {
                              alwaysShowDecimals: true,
                            })}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 text-sm font-semibold text-gray-900">
                      <span>Subtotal</span>
                      <span>
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
                            value="pickup"
                            {...register("shippingOption")}
                            className="h-4 w-4 accent-primary-600"
                          />
                          <span className="flex-1">Local pickup</span>
                          <span className="font-semibold">$0</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            value="beirut"
                            {...register("shippingOption")}
                            className="h-4 w-4 accent-primary-600"
                          />
                          <span className="flex-1">Beirut</span>
                          <span className="font-semibold">$3</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            value="outside"
                            {...register("shippingOption")}
                            className="h-4 w-4 accent-primary-600"
                          />
                          <span className="flex-1">Outside Beirut</span>
                          <span className="font-semibold">$5</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-base font-semibold text-gray-900">
                      <span>Total</span>
                      <span>
                        {formatPrice(total, { alwaysShowDecimals: true })}
                      </span>
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full rounded-full text-sm font-semibold"
                        disabled={isSubmitting || isEmpty}
                      >
                        {isSubmitting ? "Placing order..." : "Place order"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
