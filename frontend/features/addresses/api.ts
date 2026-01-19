import { apiClient } from "@/lib/api/client";
import type { BackendResponse } from "@/lib/types/api";
import { extractResponseData } from "@/lib/api/response-transformer";

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
  state?: string;
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

export const addressesApi = {
  async getAddresses(): Promise<Address[]> {
    const response = await apiClient.get<BackendResponse<Address[]>>("/addresses");
    return extractResponseData(response);
  },

  async getAddressById(id: string): Promise<Address> {
    const response = await apiClient.get<BackendResponse<Address>>(`/addresses/${id}`);
    return extractResponseData(response);
  },

  async createAddress(data: CreateAddressData): Promise<Address> {
    const response = await apiClient.post<BackendResponse<Address>>("/addresses", data);
    return extractResponseData(response);
  },

  async updateAddress(
    id: string,
    data: UpdateAddressData
  ): Promise<Address> {
    const response = await apiClient.put<BackendResponse<Address>>(
      `/addresses/${id}`,
      data
    );
    return extractResponseData(response);
  },

  async deleteAddress(id: string): Promise<void> {
    await apiClient.delete(`/addresses/${id}`);
  },
};

