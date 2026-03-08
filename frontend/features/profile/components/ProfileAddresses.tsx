// Profile view of saved addresses.
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/spinner";
import { extractErrorMessage } from "@/lib/api/error-handler";
import { AddressForm } from "./AddressForm";
import { Button } from "@/components/ui/button";
import type { Address } from "@/features/addresses/api";
import {
  useAddressesQuery,
  useDeleteAddressMutation,
  useUpdateAddressMutation,
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

export function ProfileAddresses() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: addressesData, isLoading, error } = useAddressesQuery();
  const deleteMutation = useDeleteAddressMutation();
  const updateMutation = useUpdateAddressMutation();

  // Ensure addresses is always an array
  let realAddresses: Address[] = [];
  if (Array.isArray(addressesData)) {
    realAddresses = addressesData;
  } else if (addressesData && typeof addressesData === "object" && "data" in addressesData) {
    const responseData = addressesData as { data?: Address[] };
    realAddresses = Array.isArray(responseData.data) ? responseData.data : [];
  }

  const addresses = realAddresses;

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast.error(
        extractErrorMessage(
          error,
          "Failed to load your saved addresses. Please try again."
        )
      );
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

  const handleSetDefault = (address: Address) => {
    if (address.isDefault) return;
    updateMutation.mutate({ id: address.id, data: { isDefault: true } });
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-fg tracking-tighter">Shipping Addresses</h2>
          <p className="text-xs font-bold text-muted-fg/60 uppercase tracking-widest">
            Manage your saved delivery locations. Your default address is auto-applied at checkout.
          </p>
        </div>
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)} 
            className="gap-2 rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-500/20 group hover:scale-[1.02] transition-transform" 
            size="sm"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            Add New Address
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/80 p-8 md:p-12 shadow-2xl shadow-gray-200/40 animate-in zoom-in-95 duration-500">
          <AddressForm
            address={editingAddress || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {!showForm && addresses.length === 0 && (
        <div className="rounded-[3rem] border-2 border-dashed border-warm-gray-200 bg-white/30 p-24 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
          <div className="w-24 h-24 rounded-[2rem] bg-white flex items-center justify-center mx-auto shadow-xl shadow-gray-200/50">
            <MapPin className="h-12 w-12 text-primary-500/40" />
          </div>
          <div className="space-y-3 max-w-sm mx-auto">
            <h3 className="text-2xl font-black text-fg tracking-tighter">Registry is empty</h3>
            <p className="text-muted-fg font-medium text-base">Add your first address to initialize your delivery profile and streamline future transactions.</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)} 
            className="gap-3 rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-500/20"
          >
            <Plus className="h-4 w-4" />
            Initialize Address Registry
          </Button>
        </div>
      )}

      {!showForm && addresses.length > 0 && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {addresses.map((address: Address, idx: number) => (
            <div
              key={address.id}
              className={`group relative overflow-hidden rounded-4xl border-2 transition-all duration-500 hover:-translate-y-2 ${
                address.isDefault
                  ? "border-primary-500/30 bg-white shadow-2xl shadow-primary-500/10"
                  : "border-white/80 bg-white/40 hover:bg-white hover:border-primary-500/20 hover:shadow-2xl hover:shadow-gray-200/40"
              }`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Card Header with Icons */}
              <div className="p-8 md:p-10">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner ${
                        address.isDefault
                          ? "bg-primary-600 text-white"
                          : "bg-white text-muted-fg group-hover:bg-primary-50 group-hover:text-primary-600"
                      }`}
                    >
                      {address.label?.toLowerCase() === "home" ? (
                        <Home className="h-7 w-7" />
                      ) : (
                        <MapPin className="h-7 w-7" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-black text-fg text-xl tracking-tighter group-hover:text-primary-600 transition-colors">
                        {address.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="px-2.5 py-0.5 h-auto text-[9px] font-black uppercase tracking-[0.15em] bg-warm-gray-100 text-muted-fg border-none">
                          {address.label || "LOCATION"}
                        </Badge>
                        {address.isDefault && (
                          <Badge variant="primary" className="px-2.5 py-0.5 h-auto text-[9px] font-black uppercase tracking-[0.15em] border-none shadow-sm">
                            DEFAULT_DESTINATION
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!address.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(address)}
                        className="h-9 rounded-xl text-[10px] font-bold uppercase tracking-wider text-primary-600 hover:bg-primary-50 transition-all duration-300"
                        disabled={updateMutation.isPending}
                      >
                        Set default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(address.id)}
                      className="h-10 w-10 rounded-xl text-muted-fg hover:text-primary-600 hover:bg-primary-50 transition-all duration-300"
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(address.id)}
                      className="h-10 w-10 rounded-xl text-muted-fg hover:text-red-600 hover:bg-red-50 transition-all duration-300"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Address Details */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-base font-black text-fg leading-tight tracking-tight">
                      {address.street}
                      {address.street2 && <span className="block opacity-60 font-bold">{address.street2}</span>}
                    </p>
                    <p className="text-sm text-muted-fg font-bold">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                       <Badge variant="outline" className="text-[10px] font-black border-warm-gray-200 text-muted-fg/60 rounded-lg px-2 py-0 h-5">
                        <Globe className="w-3 h-3 mr-1.5 opacity-50" />
                        {address.country?.toUpperCase() || "LEBANON"}
                      </Badge>
                    </div>
                  </div>

                  {address.phone && (
                    <div className="flex items-center gap-4 pt-6 border-t border-warm-gray-100/60">
                      <div className="w-10 h-10 rounded-xl bg-warm-gray-50 flex items-center justify-center text-muted-fg shadow-inner">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-muted-fg/40 uppercase tracking-[0.2em]">Contact Voice</p>
                        <p className="text-sm font-black text-fg tracking-tight">{address.phone}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card footer decorative element */}
                <div className={`absolute bottom-0 right-0 w-24 h-24 bg-linear-to-br ${address.isDefault ? 'from-primary-500/5 to-primary-500/20' : 'from-transparent to-warm-gray-50/50'} rounded-tl-[120px] opacity-50`} />
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
        <DialogContent className="rounded-3xl max-w-sm p-8 border-none shadow-2xl">
          <DialogHeader className="space-y-6">
            <div className="w-20 h-20 rounded-[1.5rem] bg-red-50 flex items-center justify-center mx-auto text-red-600 shadow-inner">
              <Trash2 className="h-10 w-10" />
            </div>
            <div className="text-center space-y-3">
              <DialogTitle className="text-2xl font-black tracking-tighter text-fg">Terminate Registry?</DialogTitle>
              <DialogDescription className="text-sm font-bold text-muted-fg leading-relaxed">
                Are you sure you want to permanently remove this delivery destination? This process is irreversible.
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-8">
            <Button variant="ghost" className="flex-1 rounded-2xl font-black uppercase tracking-widest text-[10px] h-14" onClick={() => setDeleteId(null)}>
              Cancel_Process
            </Button>
            <Button
              onClick={() => deleteId && handleDelete(deleteId)}
              className="flex-1 bg-red-600 hover:bg-red-700 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/30 border-none h-14"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Terminating..." : "Confirm_Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

