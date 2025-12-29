// Admin list of orders with actions.
"use client";

import Link from "next/link";
import { Eye, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "./OrderStatusBadge";
import type { AdminOrder } from "@/features/admin/types";

interface OrderListProps {
  orders: AdminOrder[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (
    field: "orderNumber" | "customer" | "status" | "totalAmount" | "createdAt"
  ) => void;
}

const SortButton = ({
  field,
  currentSort,
  sortOrder,
  onClick,
  children,
}: {
  field: string;
  currentSort?: string;
  sortOrder?: "asc" | "desc";
  onClick: () => void;
  children: React.ReactNode;
}) => {
  const isActive = currentSort === field;
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
    >
      {children}
      <ArrowUpDown
        className={`h-4 w-4 ${isActive ? "text-primary-600" : "text-gray-400"}`}
      />
      {isActive && (
        <span className="text-xs text-primary-600">
          {sortOrder === "asc" ? "↑" : "↓"}
        </span>
      )}
    </button>
  );
};

export function OrderList({
  orders,
  sortBy,
  sortOrder,
  onSort,
}: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-sm text-gray-500">No orders found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {onSort ? (
                  <SortButton
                    field="orderNumber"
                    currentSort={sortBy}
                    sortOrder={sortOrder}
                    onClick={() => onSort("orderNumber")}
                  >
                    Order #
                  </SortButton>
                ) : (
                  "Order #"
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {onSort ? (
                  <SortButton
                    field="customer"
                    currentSort={sortBy}
                    sortOrder={sortOrder}
                    onClick={() => onSort("customer")}
                  >
                    Customer
                  </SortButton>
                ) : (
                  "Customer"
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {onSort ? (
                  <SortButton
                    field="createdAt"
                    currentSort={sortBy}
                    sortOrder={sortOrder}
                    onClick={() => onSort("createdAt")}
                  >
                    Date
                  </SortButton>
                ) : (
                  "Date"
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {onSort ? (
                  <SortButton
                    field="status"
                    currentSort={sortBy}
                    sortOrder={sortOrder}
                    onClick={() => onSort("status")}
                  >
                    Status
                  </SortButton>
                ) : (
                  "Status"
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {onSort ? (
                  <SortButton
                    field="totalAmount"
                    currentSort={sortBy}
                    sortOrder={sortOrder}
                    onClick={() => onSort("totalAmount")}
                  >
                    Total
                  </SortButton>
                ) : (
                  "Total"
                )}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-sm font-medium text-primary-600 hover:text-primary-600"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {order.customer.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.customer.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ${order.totalAmount.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Link href={`/admin/orders/${order.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-200">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="block p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-primary-600">
                    {order.orderNumber}
                  </span>
                  <OrderStatusBadge status={order.status} size="sm" />
                </div>
                <div className="text-sm text-gray-900">
                  {order.customer.name}
                </div>
                <div className="text-xs text-gray-500">
                  {order.customer.email}
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                  <span>
                    {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                  </span>
                </div>
              </div>
              <Eye className="h-5 w-5 text-gray-400 shrink-0 ml-2" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
