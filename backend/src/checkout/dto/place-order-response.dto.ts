export class PlaceOrderResponseDto {
  orderId!: string;
  orderNumber!: string;
  total!: number;
  shipping!: number;
  subtotal!: number;
  items?: Array<{
    id: string;
    productId: string;
    variantId: string;
    quantity: number;
    unitPrice: number;
    total: number;
    title: string;
    attributes?: Record<string, string>;
  }>;
}
