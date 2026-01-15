// Profile order history list.
"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useEffect } from "react";
import { useOrdersQuery } from "@/features/orders/queries";
import { LoadingSpinner } from "@/components/ui/spinner";
import { extractErrorMessage } from "@/lib/utils/error-handler";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  ExternalLink,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const statusConfig: Record<string, { variant: any; icon: any }> = {
  PENDING: { variant: "warning", icon: Clock },
  PROCESSING: { variant: "secondary", icon: Package },
  SHIPPED: { variant: "outline", icon: Truck },
  DELIVERED: { variant: "success", icon: CheckCircle2 },
  CANCELLED: { variant: "destructive", icon: Clock },
};

// Mock orders for high-quality preview when backend is not available
const mockOrders = [
  {
    id: "ord-1",
    orderNumber: "SH-99281",
    createdAt: "2024-01-10T10:00:00.000Z",
    status: "DELIVERED",
    totalAmount: 129.99,
    items: [
      { id: "item-1", productName: "Sony WF-1000XM5 Premium Edition", productSlug: "sony-wf-1000xm5-premium", quantity: 1, price: 129.99 }
    ],
    address: { name: "Alex Thompson", city: "New York", state: "NY" }
  },
  {
    id: "ord-2",
    orderNumber: "SH-99102",
    createdAt: "2024-01-12T14:30:00.000Z",
    status: "PROCESSING",
    totalAmount: 45.00,
    items: [
      { id: "item-2", productName: "OtterBox Defender iPhone Case", productSlug: "otterbox-defender-iphone-case", quantity: 1, price: 45.00 }
    ],
    address: { name: "Alex Thompson", city: "New York", state: "NY" }
  }
];

export function ProfileOrders() {
  // React Query hook - automatically cached and deduplicated
  const {
    data: ordersData,
    isLoading,
    error,
  } = useOrdersQuery({
    limit: 50, // Get more orders for profile page
  });

  // Extract data from query result or fallback to mock for design preview
  const orders = ordersData?.data?.length ? ordersData.data : mockOrders;

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast.error(extractErrorMessage(error, "Showing preview orders (failed to load real ones)"));
    }
  }, [error]);

  if (isLoading && !ordersData) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/40 bg-surface-muted/20 p-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-surface-muted flex items-center justify-center mx-auto">
          <ShoppingBag className="h-10 w-10 text-muted-fg/40" />
        </div>
        <div className="space-y-2 max-w-xs mx-auto">
          <h3 className="text-xl font-bold text-fg tracking-tight">No orders yet</h3>
          <p className="text-muted-fg text-sm font-medium">Looks like you haven't placed any orders. Start exploring our collection!</p>
        </div>
        <Link href="/products" passHref>
          <Button variant="default" className="font-bold uppercase tracking-widest text-xs px-8">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-fg tracking-tight">Order History</h2>
          <p className="text-muted-fg text-sm font-medium">Manage and track your recent purchases</p>
        </div>
        <div className="relative max-w-xs w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg/60" />
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-border/40 bg-surface-muted/20 focus:outline-none focus:ring-2 focus:ring-primary-500/10 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {orders.map((order) => {
          const config = statusConfig[order.status] || statusConfig.PENDING;
          const StatusIcon = config.icon;

          return (
            <div
              key={order.id}
              className="group relative overflow-hidden rounded-2xl border border-border/40 bg-surface-muted/20 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/20 hover:border-primary-500/20"
            >
              <div className="p-6 md:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-8 border-b border-border/40">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-fg uppercase tracking-[0.2em]">Order Number</p>
                      <h3 className="text-lg font-bold text-fg tracking-tight">#{order.orderNumber}</h3>
                    </div>
                    <div className="w-px h-10 bg-border/40 hidden sm:block" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-fg uppercase tracking-[0.2em]">Date Placed</p>
                      <p className="text-sm font-bold text-fg">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="w-px h-10 bg-border/40 hidden sm:block" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-fg uppercase tracking-[0.2em]">Total Amount</p>
                      <p className="text-lg font-black text-primary-600 tracking-tight">
                        {formatPrice(order.totalAmount, { alwaysShowDecimals: true })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={config.variant} size="lg" className="px-4 py-1.5 h-auto text-[10px] font-black tracking-[0.15em]">
                      <StatusIcon className="w-3.5 h-3.5 mr-2 opacity-70" />
                      {order.status}
                    </Badge>
                    <Link href={`/profile/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl font-bold text-xs uppercase tracking-widest">
                        Details <ChevronRight className="ml-1.5 w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  {/* Order Items */}
                  <div className="space-y-4">
                    <p className="text-[11px] font-black text-fg uppercase tracking-[0.2em] mb-4 opacity-50">Items purchased</p>
                    <div className="space-y-3">
                      {order.items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 group/item"
                        >
                          <div className="w-12 h-12 rounded-xl bg-surface-muted flex items-center justify-center text-muted-fg shrink-0 border border-border/20 group-hover/item:bg-primary-50 group-hover/item:border-primary-200 transition-colors">
                            <ShoppingBag className="w-5 h-5 opacity-60 group-hover/item:text-primary-600 transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${item.productSlug}`}
                              className="block font-bold text-sm text-fg hover:text-primary-600 transition-colors truncate"
                            >
                              {item.productName}
                            </Link>
                            <p className="text-xs text-muted-fg font-medium">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                          </div>
                          <p className="text-sm font-black text-fg tracking-tight">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <button className="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-2 hover:underline">
                          + {order.items.length - 3} more items in this order
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="rounded-2xl bg-surface-muted/30 border border-border/20 p-5 space-y-4">
                    <p className="text-[11px] font-black text-fg uppercase tracking-[0.2em] opacity-50">Shipping Details</p>
                    <div className="space-y-2">
                      <p className="font-bold text-sm text-fg">{order.address.name}</p>
                      <div className="flex items-start gap-2 text-xs text-muted-fg font-medium leading-relaxed">
                        <div className="mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <p>{order.address.city}, {order.address.state}</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button variant="ghost" size="sm" className="h-8 p-0 text-primary-600 font-bold uppercase tracking-widest text-[9px] hover:bg-transparent">
                        Download Invoice <ExternalLink className="ml-1.5 w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

