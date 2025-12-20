// Address selector component for checkout - allows selecting saved addresses or entering new one.
"use client";

import Link from "next/link";
import { useAddressesQuery } from "@/features/addresses/queries";
import type { Address } from "@/features/addresses/api";
import { MapPin, Plus, Check } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface AddressSelectorProps {
  selectedAddressId: string | null;
  onSelectAddress: (address: Address | null) => void;
  onUseForm?: () => void;
}

export function AddressSelector({
  selectedAddressId,
  onSelectAddress,
  onUseForm,
}: AddressSelectorProps) {
  const { data: addresses = [], isLoading } = useAddressesQuery();

  const handleSelectAddress = (address: Address) => {
    onSelectAddress(address);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <LoadingSpinner />
      </div>
    );
  }

  const handleUseForm = () => {
    onSelectAddress(null);
    onUseForm?.();
  };

  if (addresses.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
        <p className="text-sm text-gray-600 mb-3">
          No saved addresses. You can enter a new address below or{" "}
          <Link
            href="/profile?tab=addresses"
            className="text-primary-600 hover:underline font-medium"
          >
            add one in your profile
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Select a saved address
        </h3>
        <div className="space-y-2">
          {addresses.map((address) => {
            const isSelected = selectedAddressId === address.id;
            return (
              <button
                key={address.id}
                type="button"
                onClick={() => handleSelectAddress(address)}
                className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                  isSelected
                    ? "border-primary-500 bg-primary-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold text-gray-900">
                        {address.name}
                      </span>
                      {address.isDefault && (
                        <span className="rounded-full bg-primary-500 px-2 py-0.5 text-xs font-medium text-white">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{address.street}</p>
                    <p className="text-sm text-gray-600">
                      {address.city}
                      {address.state && `, ${address.state}`}
                      {address.zipCode && ` ${address.zipCode}`}
                    </p>
                    {address.phone && (
                      <p className="text-sm text-gray-600">{address.phone}</p>
                    )}
                  </div>
                  {isSelected && (
                    <div className="ml-4 shrink-0">
                      <div className="rounded-full bg-primary-500 p-1">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Option to use form instead */}
      {onUseForm && (
        <div>
          <button
            type="button"
            onClick={handleUseForm}
            className="w-full rounded-lg border-2 border-gray-200 bg-white p-4 text-left transition-all hover:border-gray-300 hover:shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-gray-500" />
              <span className="font-semibold text-gray-900">
                Enter address manually
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

