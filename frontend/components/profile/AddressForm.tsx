// Profile form for adding or editing addresses.
"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { addressSchema } from "@/lib/validations/profile.schemas";
import {
  addressesApi,
  type Address,
  type CreateAddressData,
} from "@/lib/api/addresses";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Alert, AlertDescription } from "../ui/alert";
import { useState } from "react";

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAddressData>({
    resolver: yupResolver(addressSchema) as any,
    defaultValues: address
      ? {
          name: address.name,
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode || undefined,
          phone: address.phone,
          isDefault: address.isDefault,
        }
      : {
          isDefault: false,
        },
  });

  const onSubmit = async (data: CreateAddressData) => {
    try {
      setIsLoading(true);
      setError(null);

      if (address) {
        await addressesApi.updateAddress(address.id, data);
      } else {
        await addressesApi.createAddress(data);
      }

      onSuccess();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to save address. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {address ? "Edit Address" : "Add New Address"}
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Input
          label="Name *"
          placeholder="e.g., Home, Work"
          {...register("name")}
          error={errors.name?.message}
        />

        <Input
          label="Street / Area *"
          placeholder="e.g., Hamra Street, Achrafieh, Badaro"
          {...register("street")}
          error={errors.street?.message}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="City *"
            placeholder="e.g., Beirut, Tripoli, Sidon"
            {...register("city")}
            error={errors.city?.message}
          />

          <Input
            label="District / Governorate *"
            placeholder="e.g., Beirut, Mount Lebanon, North Lebanon"
            {...register("state")}
            error={errors.state?.message}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Postal Code (Optional)"
            placeholder="Optional"
            {...register("zipCode")}
            error={errors.zipCode?.message}
          />

          <Input
            label="Phone *"
            placeholder="+961 3 123 456 or 03 123 456"
            {...register("phone")}
            error={errors.phone?.message}
          />
        </div>

        <Checkbox
          id="isDefault"
          label="Set as default address"
          {...register("isDefault")}
        />

        <div className="flex gap-4 pt-4">
          <Button type="submit" isLoading={isLoading} className="flex-1">
            {address ? "Update Address" : "Add Address"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
