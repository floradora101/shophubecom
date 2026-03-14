/**
 * useCheckoutAddress Hook
 *
 * Manages address selection and form pre-filling.
 *
 * Responsibilities:
 * - Address selection state
 * - Auto-select default address
 * - Pre-fill form when address is selected
 * - Reset form when address is cleared
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { useAddressesQuery } from "@/features/addresses/queries";
import type { Address } from "@/features/addresses/api";
import { USE_MOCKS } from "@/lib/flags";
import type { CheckoutFormData } from "../types";

interface UseCheckoutAddressProps {
  form: UseFormReturn<CheckoutFormData>;
  cartShippingOption: CheckoutFormData["shippingOption"];
  isAuthenticated?: boolean;
  /** Default email (e.g. from user profile) - used when resetting form for logged-in users */
  defaultEmail?: string;
  /** User profile - used to pre-fill firstName/lastName when no saved addresses exist */
  user?: { firstName?: string; lastName?: string } | null;
}

interface UseCheckoutAddressReturn {
  addresses: Address[];
  selectedAddress: Address | null;
  handleSelectAddress: (address: Address | null) => void;
  handleUseForm: () => void;
  applySelectedAddress: () => void;
}

/**
 * Hook for managing checkout address selection
 */
export function useCheckoutAddress({
  form,
  cartShippingOption,
  isAuthenticated = false,
  defaultEmail = "",
  user,
}: UseCheckoutAddressProps): UseCheckoutAddressReturn {
  const { data } = useAddressesQuery({
    enabled: isAuthenticated && !USE_MOCKS,
  });
  const addresses = Array.isArray(data) ? data : [];
  const [addressSelection, setAddressSelection] = useState<
    Address | null | undefined
  >(undefined);
  const { setValue, reset, getValues } = form;

  const selectedAddress = useMemo(() => {
    if (addressSelection !== undefined) {
      return addressSelection;
    }
    // Prefer default address; if none exists, fall back to first address for better UX
    const defaultAddr = addresses.find((addr) => addr.isDefault);
    return defaultAddr ?? addresses[0] ?? null;
  }, [addressSelection, addresses]);

  const lastAppliedKeyRef = useRef<string | null>(null);

  const applySelectedAddress = useCallback(() => {
    if (selectedAddress) {
      const nameParts = selectedAddress.name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      reset({
        firstName,
        lastName: lastName || firstName,
        phone: selectedAddress.phone || "",
        email: getValues("email") || defaultEmail,
        country: selectedAddress.country || "Lebanon",
        city: selectedAddress.city,
        state: selectedAddress.state || "",
        street1: selectedAddress.street,
        postalCode: selectedAddress.zipCode || "",
        notes: getValues("notes") || "",
        shippingOption: cartShippingOption,
      });
    } else if (isAuthenticated && user && addresses.length === 0) {
      const firstName = user.firstName?.trim() || "";
      const lastName = user.lastName?.trim() || "";
      if (firstName || lastName) {
        setValue("firstName", firstName);
        setValue("lastName", lastName);
      }
    }
  }, [
    selectedAddress,
    reset,
    setValue,
    getValues,
    defaultEmail,
    cartShippingOption,
    isAuthenticated,
    user,
    addresses.length,
  ]);

  // Pre-fill when address loads; use ref to prevent infinite loop (reset triggers re-render)
  useEffect(() => {
    const key = selectedAddress?.id ?? (addresses.length === 0 ? "user" : "none");
    if (lastAppliedKeyRef.current === key) return;
    lastAppliedKeyRef.current = key;
    applySelectedAddress();
  }, [selectedAddress?.id, addresses.length, applySelectedAddress]);

  // Handle address selection
  const handleSelectAddress = (address: Address | null) => {
    setAddressSelection(address);
    if (!address) {
      // Reset form when "Use new address" is selected (keep defaultEmail for logged-in users)
      reset({
        firstName: "",
        lastName: "",
        phone: "",
        email: defaultEmail,
        country: "Lebanon",
        city: "",
        state: "",
        street1: "",
        postalCode: "",
        notes: "",
        shippingOption: cartShippingOption,
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
      setValue("shippingOption", cartShippingOption);
    }
  };

  // Handle clearing selected address to use form
  const handleUseForm = () => {
    setAddressSelection(null);
    reset({
      firstName: "",
      lastName: "",
      phone: "",
      email: defaultEmail,
      country: "Lebanon",
      city: "",
      state: "",
      street1: "",
      postalCode: "",
      notes: "",
      shippingOption: cartShippingOption,
    });
  };

  return {
    addresses,
    selectedAddress,
    handleSelectAddress,
    handleUseForm,
    applySelectedAddress,
  };
}
