// Profile order history list.
"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useOrdersQuery } from "@/features/orders/queries";
import { LoadingSpinner } from "@/components/ui/spinner";
import { extractErrorMessage } from "@/lib/api/error-handler";
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
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { productRoutes } from "@/lib/routes";

const ORDERS_PER_PAGE = 10;

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

export function ProfileOrders() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = useMemo(() => {
    const p = searchParams.get("page");
    const num = p ? parseInt(p, 10) : 1;
    return isNaN(num) || num < 1 ? 1 : num;
  }, [searchParams]);

  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", newPage.toString());
    }
    router.replace(`/profile?${params.toString()}`, { scroll: false });
  };

  const { data: ordersData, isLoading, error } = useOrdersQuery({
    page,
    limit: ORDERS_PER_PAGE,
  });

  const orders = ordersData?.data ?? [];
  const totalPages = ordersData?.totalPages ?? 0;
  const total = ordersData?.total ?? 0;

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast.error(
        extractErrorMessage(
          error,
          "Failed to load your orders. Please try again."
        )
      );
    }
  }, [error]);

  if (isLoading && !ordersData) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isLoading && orders.length === 0) {
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
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-fg tracking-tight">Order History</h2>
        <p className="text-muted-fg text-sm font-medium">Manage and track your recent purchases</p>
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
                              href={productRoutes.detail(item.productSlug)}
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

      {/* Pagination - only when we have real API data and multiple pages */}
      {ordersData && totalPages > 1 && (
        <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-fg font-medium">
            Showing {(page - 1) * ORDERS_PER_PAGE + 1}–{Math.min(page * ORDERS_PER_PAGE, total)} of {total} orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1 || isLoading}
              className="rounded-xl gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm font-medium text-fg px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages || isLoading}
              className="rounded-xl gap-1.5"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

