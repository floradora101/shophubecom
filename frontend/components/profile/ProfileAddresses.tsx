// Profile view of saved addresses.
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AddressForm } from "./AddressForm";
import { Button } from "@/components/ui/button";
import type { Address } from "@/lib/api/addresses";
import {
  useAddressesQuery,
  useDeleteAddressMutation,
} from "@/lib/queries/addresses";
import { Edit, Trash2, Plus, MapPin, Phone, Home } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ProfileAddresses() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: addressesData, isLoading, error } = useAddressesQuery();
  const deleteMutation = useDeleteAddressMutation();

  // Ensure addresses is always an array
  // Handle case where query might return full response object {success: true, data: [...]} instead of array
  let addresses: Address[] = [];

  if (Array.isArray(addressesData)) {
    addresses = addressesData;
  } else if (
    addressesData &&
    typeof addressesData === "object" &&
    "data" in addressesData
  ) {
    const responseData = addressesData as { data?: Address[] };
    addresses = Array.isArray(responseData.data) ? responseData.data : [];
  }

  // Final check - ensure we have an array
  if (!Array.isArray(addresses)) {
    addresses = [];
  }

  // Show error toast if query fails (consistent with ProfileOrders pattern)
  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load addresses";
    toast.error(errorMessage);
  }

  const handleDelete = async (id: string) => {
    deleteMutation.mutate(id);
    setDeleteId(null);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const editingAddress = editingId
    ? addresses.find((a: Address) => a.id === editingId)
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
        Failed to load addresses. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Addresses</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your shipping addresses for faster checkout
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2" size="sm">
            <Plus className="h-4 w-4" />
            Add Address
          </Button>
        )}
      </div>

      {showForm && (
        <AddressForm
          address={editingAddress || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {!showForm && addresses.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No addresses yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add your first address to make checkout faster and easier.
          </p>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Your First Address
          </Button>
        </div>
      )}

      {!showForm && addresses.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address: Address) => (
            <div
              key={address.id}
              className={`group relative rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                address.isDefault
                  ? "border-primary-500 bg-linear-to-br from-primary-50 to-white shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {/* Default Badge */}
              {address.isDefault && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    Default
                  </span>
                </div>
              )}

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 pr-16">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 rounded-lg p-2 ${
                        address.isDefault
                          ? "bg-primary-100 text-primary-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {address.label === "Home" ||
                      address.label?.toLowerCase() === "home" ? (
                        <Home className="h-4 w-4" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {address.name}
                      </h3>
                      {address.label && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {address.label}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">{address.street}</p>
                      {address.street2 && (
                        <p className="text-gray-600">{address.street2}</p>
                      )}
                      <p className="text-gray-600">
                        {address.city}
                        {address.state && `, ${address.state}`}
                        {address.zipCode && ` ${address.zipCode}`}
                      </p>
                      {address.country && (
                        <p className="text-gray-600">{address.country}</p>
                      )}
                    </div>
                  </div>
                  {address.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                      <span>{address.phone}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(address.id)}
                    className="flex-1 gap-2"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(address.id)}
                    className="flex-1 gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Address</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this address? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
