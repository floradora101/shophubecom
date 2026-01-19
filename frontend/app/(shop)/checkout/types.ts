/**
 * Checkout Page Types
 */

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  country: string;
  city: string;
  state?: string;
  street1: string;
  postalCode: string;
  notes?: string;
  shippingOption: "pickup" | "beirut" | "outside";
}
