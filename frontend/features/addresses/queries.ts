import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addressesApi,
  type Address,
  type CreateAddressData,
  type UpdateAddressData,
} from "./api";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/api/error-handler";
import { addressKeys } from "./query-keys";

/**
 * Get all addresses for the current user
 */
export function useAddressesQuery(options?: { enabled?: boolean }) {
  return useQuery<Address[]>({
    queryKey: addressKeys.list(),
    queryFn: () => addressesApi.getAddresses(),
    enabled: options?.enabled !== false,
    staleTime: 30_000, // 30 seconds
  });
}

/**
 * Get a single address by ID
 */
export function useAddressQuery(id: string, enabled = true) {
  return useQuery<Address>({
    queryKey: addressKeys.detail(id),
    queryFn: () => addressesApi.getAddressById(id),
    enabled: enabled && !!id,
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Create a new address mutation
 */
export function useCreateAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAddressData) => addressesApi.createAddress(data),
    onSuccess: () => {
      // Invalidate and refetch addresses list
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
      toast.success("Address added successfully");
    },
    onError: (error: unknown) => {
      toast.error(
        extractErrorMessage(error, "Failed to add address. Please try again.")
      );
    },
  });
}

/**
 * Update an existing address mutation
 */
export function useUpdateAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAddressData }) =>
      addressesApi.updateAddress(id, data),
    onSuccess: (_, variables) => {
      // Invalidate addresses list and specific address
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: addressKeys.detail(variables.id),
      });
      toast.success("Address updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(
        extractErrorMessage(
          error,
          "Failed to update address. Please try again."
        )
      );
    },
  });
}

/**
 * Delete an address mutation
 */
export function useDeleteAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => addressesApi.deleteAddress(id),
    onSuccess: () => {
      // Invalidate addresses list
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
      toast.success("Address deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(
        extractErrorMessage(
          error,
          "Failed to delete address. Please try again."
        )
      );
    },
  });
}
