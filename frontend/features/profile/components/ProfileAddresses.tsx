// Profile view of saved addresses.
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/spinner";
import { extractErrorMessage } from "@/lib/utils/error-handler";
import { AddressForm } from "./AddressForm";
import { Button } from "@/components/ui/button";
import type { Address } from "@/features/addresses/api";
import {
  useAddressesQuery,
  useDeleteAddressMutation,
} from "@/features/addresses/queries";
import { Edit, Trash2, Plus, MapPin, Phone, Home, Check, Globe, MoreVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// Mock addresses for design preview
const mockAddresses: Address[] = [
  {
    id: "addr-1",
    name: "Home",
    label: "Home",
    street: "123 Fifth Avenue",
    street2: "Suite 400",
    city: "New York",
    state: "NY",
    zipCode: "10003",
    country: "USA",
    phone: "+1 (555) 123-4567",
    isDefault: true,
    userId: "user-1",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: "addr-2",
    name: "Office",
    label: "Work",
    street: "456 Corporate Plaza",
    city: "Brooklyn",
    state: "NY",
    zipCode: "11201",
    country: "USA",
    phone: "+1 (555) 987-6543",
    isDefault: false,
    userId: "user-1",
    createdAt: "2024-01-05T00:00:00.000Z",
    updatedAt: "2024-01-05T00:00:00.000Z"
  }
];

export function ProfileAddresses() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: addressesData, isLoading, error } = useAddressesQuery();
  const deleteMutation = useDeleteAddressMutation();

  // Ensure addresses is always an array
  let realAddresses: Address[] = [];
  if (Array.isArray(addressesData)) {
    realAddresses = addressesData;
  } else if (addressesData && typeof addressesData === "object" && "data" in addressesData) {
    const responseData = addressesData as { data?: Address[] };
    realAddresses = Array.isArray(responseData.data) ? responseData.data : [];
  }

  // Fallback to mock for preview if no real addresses
  const addresses = realAddresses.length > 0 ? realAddresses : mockAddresses;

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast.error(extractErrorMessage(error, "Showing preview addresses (failed to load real ones)"));
    }
  }, [error]);

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

  if (isLoading && !addressesData) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-fg tracking-tight">Shipping Addresses</h2>
          <p className="text-muted-fg text-sm font-medium">
            Manage your saved delivery locations
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2 rounded-xl h-11 px-6 font-bold uppercase tracking-widest text-xs" size="sm">
            <Plus className="h-4 w-4" />
            Add New Address
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-surface-muted/30 backdrop-blur-sm rounded-2xl border border-border/40 p-6 md:p-8 shadow-xl animate-in zoom-in-95 duration-300">
          <AddressForm
            address={editingAddress || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {!showForm && addresses.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/40 bg-surface-muted/20 p-20 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-surface-muted flex items-center justify-center mx-auto">
            <MapPin className="h-10 w-10 text-muted-fg/40" />
          </div>
          <div className="space-y-2 max-w-xs mx-auto">
            <h3 className="text-xl font-bold text-fg tracking-tight">No addresses yet</h3>
            <p className="text-muted-fg text-sm font-medium">Add your first address to make checkout faster and easier.</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2 rounded-xl h-11 px-8 font-bold uppercase tracking-widest text-xs">
            <Plus className="h-4 w-4" />
            Add Your First Address
          </Button>
        </div>
      )}

      {!showForm && addresses.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {addresses.map((address: Address) => (
            <div
              key={address.id}
              className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                address.isDefault
                  ? "border-primary-500/20 bg-surface-muted/20 shadow-xl shadow-primary-500/5"
                  : "border-border/40 bg-surface-muted/10 hover:border-primary-500/10 hover:shadow-lg hover:shadow-gray-200/20"
              }`}
            >
              {/* Card Header with Icons */}
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        address.isDefault
                          ? "bg-primary-50 text-primary-600"
                          : "bg-surface-muted text-muted-fg group-hover:bg-primary-50 group-hover:text-primary-600"
                      }`}
                    >
                      {address.label?.toLowerCase() === "home" ? (
                        <Home className="h-6 w-6" />
                      ) : (
                        <MapPin className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-fg text-lg tracking-tight">
                        {address.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="px-2 py-0 h-5 text-[9px] font-black uppercase tracking-widest bg-surface-muted text-muted-fg border-none">
                          {address.label || "Address"}
                        </Badge>
                        {address.isDefault && (
                          <Badge variant="primary" className="px-2 py-0 h-5 text-[9px] font-black uppercase tracking-widest border-none">
                            Default
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(address.id)}
                      className="h-8 w-8 rounded-lg text-muted-fg hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(address.id)}
                      className="h-8 w-8 rounded-lg text-muted-fg hover:text-red-600 hover:bg-red-50 transition-colors"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Address Details */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-fg leading-relaxed">
                      {address.street}
                      {address.street2 && <span className="block">{address.street2}</span>}
                    </p>
                    <p className="text-sm text-muted-fg font-medium">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-[10px] font-black text-muted-fg/60 uppercase tracking-widest pt-1 flex items-center gap-1.5">
                      <Globe className="w-3 h-3" />
                      {address.country || "USA"}
                    </p>
                  </div>

                  {address.phone && (
                    <div className="flex items-center gap-2.5 pt-4 border-t border-border/40 text-sm font-bold text-fg">
                      <div className="w-8 h-8 rounded-lg bg-surface-muted flex items-center justify-center text-muted-fg">
                        <Phone className="h-3.5 w-3.5" />
                      </div>
                      <span>{address.phone}</span>
                    </div>
                  )}
                </div>

                {/* Card footer decorative element */}
                <div className={`absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-br ${address.isDefault ? 'from-primary-500/5 to-primary-500/10' : 'from-transparent to-surface-muted'} rounded-tl-[100px] opacity-50`} />
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
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-600">
              <Trash2 className="h-6 w-6" />
            </div>
            <div className="text-center space-y-2">
              <DialogTitle className="text-xl font-bold tracking-tight text-fg">Delete Address?</DialogTitle>
              <DialogDescription className="text-sm font-medium text-muted-fg">
                Are you sure you want to delete this address? This action cannot be undone.
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0 pt-4">
            <Button variant="ghost" className="flex-1 rounded-xl font-bold uppercase tracking-widest text-[10px]" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => deleteId && handleDelete(deleteId)}
              className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 border-none h-11"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

