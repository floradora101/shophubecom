import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api/request";

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
    return apiGet<Address[]>("/addresses");
  },

  async getAddressById(id: string): Promise<Address> {
    return apiGet<Address>(`/addresses/${id}`);
  },

  async createAddress(data: CreateAddressData): Promise<Address> {
    return apiPost<Address>("/addresses", data);
  },

  async updateAddress(
    id: string,
    data: UpdateAddressData
  ): Promise<Address> {
    return apiPut<Address>(`/addresses/${id}`, data);
  },

  async deleteAddress(id: string): Promise<void> {
    await apiDelete<void>(`/addresses/${id}`);
  },
};

