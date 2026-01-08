// Profile form for adding or editing addresses.
"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import type { Resolver } from "react-hook-form";
import { addressSchema } from "../schemas";
import {
  addressesApi,
  type Address,
  type CreateAddressData,
} from "@/features/addresses/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormErrorAlert } from "@/components/ui/form-error-alert";
import { FormField } from "@/components/ui/form-field";
import { useFormErrorHandler } from "@/lib/forms/useFormErrorHandler";
import { useFormDraft } from "@/lib/forms/useFormDraft";

interface AddressFormProps {
  address?: Address;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddressForm({
  address,
  onSuccess,
  onCancel,
}: AddressFormProps) {
  const form = useForm<CreateAddressData>({
    resolver: yupResolver(addressSchema) as Resolver<CreateAddressData>,
    defaultValues: address
      ? {
          name: address.name,
          street: address.street,
          city: address.city,
          state: address.state ?? undefined,
          zipCode: address.zipCode ?? undefined,
          phone: address.phone ?? undefined,
          isDefault: address.isDefault,
        }
      : {
          isDefault: false,
        },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  // Enable draft persistence only for create mode (new addresses)
  const { clearDraft } = useFormDraft(form, {
    key: `draft:address:${address?.id || "new"}`,
    storage: "session",
    enabled: !address,
  });

  const { formError, handleError, handleValidationError, clearError } =
    useFormErrorHandler({
      fallbackMessage: "Failed to save address. Please try again.",
    });

  const onSubmit = async (data: CreateAddressData) => {
    clearError();
    try {
      if (address) {
        await addressesApi.updateAddress(address.id, data);
      } else {
        await addressesApi.createAddress(data);
        clearDraft();
        reset();
      }

      onSuccess();
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {address ? "Edit Address" : "Add New Address"}
      </h3>

      <form
        onSubmit={handleSubmit(onSubmit, handleValidationError)}
        className="space-y-4"
        noValidate
        aria-label={address ? "Edit address form" : "Add new address form"}
      >
        <FormErrorAlert error={formError} onDismiss={clearError} dismissible />

        <FormField label="Name" required error={errors.name?.message}>
          <Input
            placeholder="e.g., Home, Work"
            {...register("name")}
            error={!!errors.name}
          />
        </FormField>

        <FormField
          label="Street / Area"
          required
          error={errors.street?.message}
        >
          <Input
            placeholder="e.g., Hamra Street, Achrafieh, Badaro"
            {...register("street")}
            error={!!errors.street}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="City" required error={errors.city?.message}>
            <Input
              placeholder="e.g., Beirut, Tripoli, Sidon"
              {...register("city")}
              error={!!errors.city}
            />
          </FormField>

          <FormField
            label="District / Governorate"
            required
            error={errors.state?.message}
          >
            <Input
              placeholder="e.g., Beirut, Mount Lebanon, North Lebanon"
              {...register("state")}
              error={!!errors.state}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Postal Code"
            error={errors.zipCode?.message}
            helpText="Optional"
          >
            <Input
              placeholder="Optional"
              {...register("zipCode")}
              error={!!errors.zipCode}
            />
          </FormField>

          <FormField label="Phone" required error={errors.phone?.message}>
            <Input
              placeholder="+961 3 123 456 or 03 123 456"
              {...register("phone")}
              error={!!errors.phone}
            />
          </FormField>
        </div>

        <Checkbox
          id="isDefault"
          label="Set as default address"
          {...register("isDefault")}
        />

        <div className="flex gap-4 pt-4">
          <Button type="submit" isLoading={isSubmitting} className="flex-1">
            {address ? "Update Address" : "Add Address"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
