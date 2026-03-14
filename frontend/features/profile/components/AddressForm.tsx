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

/** Form-specific type: firstName/lastName combine to API `name` */
type AddressFormData = Omit<CreateAddressData, "name"> & {
  firstName: string;
  lastName: string;
};
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingButton } from "@/components/ui/loading-button";
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
  const form = useForm<AddressFormData>({
    resolver: yupResolver(addressSchema) as Resolver<AddressFormData>,
    defaultValues: address
      ? (() => {
          const parts = address.name.trim().split(/\s+/);
          return {
            firstName: parts[0] || "",
            lastName: parts.slice(1).join(" ") || "",
            street: address.street,
            city: address.city,
            state: address.state ?? undefined,
            zipCode: address.zipCode ?? undefined,
            phone: address.phone ?? undefined,
            isDefault: address.isDefault,
          };
        })()
      : {
          firstName: "",
          lastName: "",
          street: "",
          city: "",
          state: undefined,
          zipCode: undefined,
          phone: undefined,
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

  const onSubmit = async (data: AddressFormData) => {
    clearError();
    const { firstName, lastName, ...rest } = data;
    const payload: CreateAddressData = {
      ...rest,
      name: `${firstName} ${lastName}`.trim(),
    };
    try {
      if (address) {
        await addressesApi.updateAddress(address.id, payload);
      } else {
        await addressesApi.createAddress(payload);
        clearDraft();
        reset();
      }

      onSuccess();
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <Badge variant="primary" size="sm" className="bg-primary-500/10 text-primary-600 border-none font-black tracking-widest text-[9px] px-3">
          {address ? "Editing" : "New Address"}
        </Badge>
        <h3 className="text-3xl font-black text-fg tracking-tighter">
          {address ? "Edit Address" : "Add New Address"}
        </h3>
        <p className="text-sm font-bold text-muted-fg/60 uppercase tracking-widest">
          {address ? "Update your saved address details" : "Add a new delivery address"}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit, handleValidationError)}
        className="space-y-8"
        noValidate
        aria-label={address ? "Edit address form" : "Add new address form"}
      >
        <FormErrorAlert error={formError} onDismiss={clearError} dismissible />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField label="First name" required error={errors.firstName?.message}>
            <Input
              placeholder="e.g., John"
              {...register("firstName")}
              error={!!errors.firstName}
              autoComplete="given-name"
              className="rounded-2xl h-14 bg-white/50 border-warm-gray-200 focus:bg-white transition-all font-bold"
            />
          </FormField>

          <FormField label="Last name" required error={errors.lastName?.message}>
            <Input
              placeholder="e.g., Doe"
              {...register("lastName")}
              error={!!errors.lastName}
              autoComplete="family-name"
              className="rounded-2xl h-14 bg-white/50 border-warm-gray-200 focus:bg-white transition-all font-bold"
            />
          </FormField>
        </div>

        <FormField
          label="Street Address"
          required
          error={errors.street?.message}
        >
          <Input
            placeholder="e.g., Building Name, Street Number, Floor"
            {...register("street")}
            error={!!errors.street}
            className="rounded-2xl h-14 bg-white/50 border-warm-gray-200 focus:bg-white transition-all font-bold"
          />
        </FormField>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <FormField label="City" required error={errors.city?.message}>
            <Input
              placeholder="e.g., Beirut, Tripoli"
              {...register("city")}
              error={!!errors.city}
              className="rounded-2xl h-14 bg-white/50 border-warm-gray-200 focus:bg-white transition-all font-bold"
            />
          </FormField>

          <FormField
            label="State"
            required
            error={errors.state?.message}
          >
            <Input
              placeholder="e.g., Mount Lebanon, North"
              {...register("state")}
              error={!!errors.state}
              className="rounded-2xl h-14 bg-white/50 border-warm-gray-200 focus:bg-white transition-all font-bold"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <FormField
            label="Postal Code"
            error={errors.zipCode?.message}
          >
            <Input
              placeholder="e.g., 1107, 2011"
              {...register("zipCode")}
              error={!!errors.zipCode}
              className="rounded-2xl h-14 bg-white/50 border-warm-gray-200 focus:bg-white transition-all font-bold"
            />
          </FormField>

          <FormField label="Phone Number" required error={errors.phone?.message}>
            <Input
              placeholder="+961 03 123 456"
              {...register("phone")}
              error={!!errors.phone}
              className="rounded-2xl h-14 bg-white/50 border-warm-gray-200 focus:bg-white transition-all font-bold"
            />
          </FormField>
        </div>

        <div className="flex items-center space-x-3 p-6 rounded-2xl bg-primary-50/50 border border-primary-100/50">
          <Checkbox
            id="isDefault"
            {...register("isDefault")}
            className="w-5 h-5 rounded-lg border-primary-200 data-[state=checked]:bg-primary-600"
          />
          <label 
            htmlFor="isDefault" 
            className="text-sm font-black text-primary-900 uppercase tracking-widest cursor-pointer select-none"
          >
            Set as default address
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <LoadingButton
            type="submit"
            loading={isSubmitting}
            className="flex-2 h-14 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-500/20"
          >
            {address ? "Save Address" : "Add Address"}
          </LoadingButton>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
