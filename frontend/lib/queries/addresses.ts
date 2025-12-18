import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addressesApi,
  type Address,
  type CreateAddressData,
  type UpdateAddressData,
} from "@/lib/api/addresses";
import { toast } from "sonner";

export const addressKeys = {
  all: ["addresses"] as const,
  lists: () => ["addresses", "list"] as const,
  list: () => ["addresses", "list"] as const,
  detail: (id: string) => ["addresses", "detail", id] as const,
};

/**
 * Get all addresses for the current user
 */
export function useAddressesQuery() {
  return useQuery<Address[]>({
    queryKey: addressKeys.list(),
    queryFn: async () => {
      // Get addresses from the API
      const response = await addressesApi.getAddresses();

      // addressesApi.getAddresses() returns AddressesResponse = { success: boolean, data: Address[] }
      // But response.data can be nested: {success: true, data: Address[]}
      // So we need to extract the nested data property if it exists
      let addresses: Address[] = [];

      if (response && typeof response === "object" && "data" in response) {
        const responseData = response.data as unknown;

        // Check if response.data is directly an array
        if (Array.isArray(responseData)) {
          addresses = responseData;
        }
        // Check if response.data is an object with a data property that is an array
        else if (
          responseData &&
          typeof responseData === "object" &&
          responseData !== null &&
          "data" in responseData
        ) {
          const nestedData = (responseData as { data?: unknown }).data;
          if (Array.isArray(nestedData)) {
            addresses = nestedData;
          }
        }
      }

      return addresses;
    },
    staleTime: 30_000, // 30 seconds
  });
}

/**
 * Get a single address by ID
 */
export function useAddressQuery(id: string, enabled = true) {
  return useQuery<Address>({
    queryKey: addressKeys.detail(id),
    queryFn: async () => {
      const response = await addressesApi.getAddressById(id);
      return response.data;
    },
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
      const errorMessage =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "Failed to add address. Please try again.";
      toast.error(errorMessage);
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
      const errorMessage =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "Failed to update address. Please try again.";
      toast.error(errorMessage);
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
      const errorMessage =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "Failed to delete address. Please try again.";
      toast.error(errorMessage);
    },
  });
}
