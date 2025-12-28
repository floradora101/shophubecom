import type { BackendOrderResponseDto } from "../api";

const DEMO_ORDERS_KEY = "demo:orders";
const MAX_ORDERS = 20;

interface DemoOrderInput {
  items: Array<{
    id: string;
    productId: string;
    variantId: string;
    quantity: number;
    unitPrice: number;
    total: number;
    title: string;
    attributes?: Record<string, unknown> | null;
    variant?: {
      id: string;
      sku: string;
      image?: string | null;
      options?: Array<{ name: string; value: string }>;
    };
    product?: {
      id: string;
      name: string;
      slug: string;
      images: string[];
    };
  }>;
  subtotal: number;
  shippingOption: "pickup" | "beirut" | "outside";
  shippingCost: number;
  total: number;
  shippingAddress: {
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
  };
}

function getDemoOrders(): BackendOrderResponseDto[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(DEMO_ORDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveDemoOrders(orders: BackendOrderResponseDto[]): void {
  if (typeof window === "undefined") return;

  try {
    // Keep only the last MAX_ORDERS
    const recentOrders = orders.slice(-MAX_ORDERS);
    localStorage.setItem(DEMO_ORDERS_KEY, JSON.stringify(recentOrders));
  } catch {
    // Ignore localStorage errors
  }
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `DEMO-${timestamp}-${random}`.toUpperCase();
}

export function createDemoOrder(
  input: DemoOrderInput
): BackendOrderResponseDto {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const order: BackendOrderResponseDto = {
    id,
    orderNumber: generateOrderNumber(),
    userId: null,
    status: "PENDING",
    paymentStatus: "PENDING",
    fulfillmentStatus: "UNFULFILLED",
    subtotal: input.subtotal,
    tax: 0,
    shipping: input.shippingCost,
    discount: 0,
    total: input.total,
    currency: "USD",
    shippingAddress: {
      fullName: `${input.shippingAddress.firstName} ${input.shippingAddress.lastName}`,
      phone: input.shippingAddress.phone,
      label: undefined,
      street1: input.shippingAddress.street1,
      street2: undefined,
      city: input.shippingAddress.city,
      state: input.shippingAddress.state,
      postalCode: input.shippingAddress.postalCode,
      country: input.shippingAddress.country,
    },
    billingAddress: null,
    items: input.items,
    placedAt: now,
    updatedAt: now,
    user: null,
  };

  const existingOrders = getDemoOrders();
  const updatedOrders = [...existingOrders, order];
  saveDemoOrders(updatedOrders);

  return order;
}

export function getDemoOrder(id: string): BackendOrderResponseDto | null {
  const orders = getDemoOrders();
  return orders.find((order) => order.id === id) || null;
}

export function listDemoOrders(): BackendOrderResponseDto[] {
  return getDemoOrders();
}

export function clearDemoOrders(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(DEMO_ORDERS_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

