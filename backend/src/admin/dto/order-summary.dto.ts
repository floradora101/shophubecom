import { OrderStatus } from '@prisma/client';

export class AdminOrderSummaryDto {
  id!: string;
  orderNumber!: string;
  status!: OrderStatus;
  totalAmount!: number;
  createdAt!: Date;
  updatedAt!: Date;
  itemCount!: number;
  customer!: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

