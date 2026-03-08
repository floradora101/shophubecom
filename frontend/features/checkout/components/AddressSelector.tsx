// Address selector component for checkout - allows selecting saved addresses or entering new one.
"use client";

import Link from "next/link";
import type { Address } from "@/features/addresses/api";
import { MapPin, Plus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AddressSelectorProps {
  addresses: Address[];
  selectedAddressId: string | null;
  onSelectAddress: (address: Address | null) => void;
  onUseForm?: () => void;
}

export function AddressSelector({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onUseForm,
}: AddressSelectorProps) {
  const handleSelectAddress = (address: Address) => {
    onSelectAddress(address);
  };

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
        <h3 className="text-[10px] font-black uppercase tracking-widest text-warm-gray-400 mb-4 ml-1">
          Select a saved address
        </h3>
        <div className="grid gap-3 sm:grid-cols-1">
          {addresses.map((address) => {
            const isSelected = selectedAddressId === address.id;
            return (
              <button
                key={address.id}
                type="button"
                onClick={() => handleSelectAddress(address)}
                className={`w-full rounded-2xl border-2 p-5 text-left transition-all duration-300 relative overflow-hidden group ${
                  isSelected
                    ? "border-primary-500 bg-primary-50/50 shadow-md ring-1 ring-primary-500/10"
                    : "border-warm-gray-200 bg-white hover:border-primary-200 hover:shadow-sm"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-10 -mt-10 blur-2xl" />
                )}

                <div className="flex items-start justify-between relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1.5 rounded-lg transition-colors ${isSelected ? "bg-primary-500 text-white" : "bg-warm-gray-100 text-warm-gray-500 group-hover:bg-primary-50 group-hover:text-primary-600"}`}>
                        <MapPin className="h-3.5 w-3.5" />
                      </div>
                      <span className={`font-bold text-sm ${isSelected ? "text-primary-900" : "text-fg"}`}>
                        {address.name}
                      </span>
                      {address.isDefault && (
                        <Badge variant="primary" size="sm" className="bg-primary-500/10 text-primary-600 border-primary-500/20 shadow-none lowercase tracking-normal font-bold">
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-0.5 ml-8">
                      <p className={`text-xs font-medium ${isSelected ? "text-primary-700/80" : "text-muted-fg"}`}>{address.street}</p>
                      <p className={`text-xs font-medium ${isSelected ? "text-primary-700/80" : "text-muted-fg"}`}>
                        {address.city}
                        {address.state && `, ${address.state}`}
                        {address.zipCode && ` ${address.zipCode}`}
                      </p>
                      {address.phone && (
                        <p className={`text-xs font-bold mt-2 ${isSelected ? "text-primary-600" : "text-fg"}`}>
                          {address.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="ml-4 shrink-0">
                      <div className="rounded-full bg-primary-500 p-1.5 shadow-lg shadow-primary-500/30">
                        <Check className="h-3 w-3 text-white stroke-[3px]" />
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
        <div className="pt-2">
          <button
            type="button"
            onClick={handleUseForm}
            className={`w-full rounded-2xl border-2 border-dashed p-5 text-left transition-all duration-300 flex items-center gap-3 ${
              selectedAddressId === null
                ? "border-primary-500 bg-primary-50/50 shadow-sm"
                : "border-warm-gray-200 bg-warm-gray-50/30 hover:border-warm-gray-300 hover:bg-warm-gray-50/50"
            }`}
          >
            <div className={`p-2 rounded-xl transition-colors ${selectedAddressId === null ? "bg-primary-500 text-white" : "bg-white text-warm-gray-400 border border-warm-gray-200"}`}>
              <Plus className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <span className={`font-bold text-sm ${selectedAddressId === null ? "text-primary-900" : "text-fg"}`}>
                Enter address manually
              </span>
              <p className="text-[10px] text-muted-fg font-medium">Use a one-time shipping address for this order</p>
            </div>
            {selectedAddressId === null && (
              <div className="rounded-full bg-primary-500 p-1.5 shadow-lg shadow-primary-500/30">
                <Check className="h-3 w-3 text-white stroke-[3px]" />
              </div>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

