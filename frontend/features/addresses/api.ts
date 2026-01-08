import { apiClient } from "@/lib/api/client";

export interface Address {
  id: string;
  userId: string;
  label?: string | null;
  name: string;
  street: string;
  street2?: string | null;
  city: string;
  state?: string | null;
  zipCode?: string | null;
  country?: string;
  phone?: string | null;

  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressData {
  name: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  label?: string;
  isDefault?: boolean;
}

export interface UpdateAddressData {
  name?: string;
  street?: string;
  street2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  label?: string;
  isDefault?: boolean;
}

export interface AddressResponse {
  success: boolean;
  data: Address;
}

export interface AddressesResponse {
  success: boolean;
  data: Address[];
}

export const addressesApi = {
  async getAddresses(): Promise<AddressesResponse> {
    // Simple API call - backend returns { success: true, data: Address[] }
    const response = await apiClient.get<AddressesResponse>("/addresses");
    // axios response.data contains the backend response body
    return response.data;
  },

  async getAddressById(id: string): Promise<AddressResponse> {
    const response = await apiClient.get<AddressResponse>(`/addresses/${id}`);
    return response.data;
  },

  async createAddress(data: CreateAddressData): Promise<AddressResponse> {
    const response = await apiClient.post<AddressResponse>("/addresses", data);
    return response.data;
  },

  async updateAddress(
    id: string,
    data: UpdateAddressData
  ): Promise<AddressResponse> {
    const response = await apiClient.put<AddressResponse>(
      `/addresses/${id}`,
      data
    );
    return response.data;
  },

  async deleteAddress(id: string): Promise<void> {
    await apiClient.delete(`/addresses/${id}`);
  },
};
