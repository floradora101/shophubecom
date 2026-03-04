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

import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { useAddressesQuery } from "@/features/addresses/queries";
import type { Address } from "@/features/addresses/api";
import type { CheckoutFormData } from "../types";

interface UseCheckoutAddressProps {
  form: UseFormReturn<CheckoutFormData>;
  cartShippingOption: CheckoutFormData["shippingOption"];
  /** Default email (e.g. from user profile) - used when resetting form for logged-in users */
  defaultEmail?: string;
}

interface UseCheckoutAddressReturn {
  addresses: Address[];
  selectedAddress: Address | null;
  setSelectedAddress: React.Dispatch<React.SetStateAction<Address | null>>;
  handleSelectAddress: (address: Address | null) => void;
  handleUseForm: () => void;
}

/**
 * Hook for managing checkout address selection
 */
export function useCheckoutAddress({
  form,
  cartShippingOption,
  defaultEmail = "",
}: UseCheckoutAddressProps): UseCheckoutAddressReturn {
  const { data: addresses = [] } = useAddressesQuery();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const { setValue, reset } = form;

  // Auto-select default address if available
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    }
  }, [addresses, selectedAddress]);

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
    setSelectedAddress(null);
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
    setSelectedAddress,
    handleSelectAddress,
    handleUseForm,
  };
}
