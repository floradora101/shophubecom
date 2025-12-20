// Admin order detail page.
"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { OrderDetail } from "@/features/admin/components/orders/OrderDetail";
import {
  useAdminOrderQuery,
  useUpdateOrderStatusMutation,
} from "@/features/admin/queries/orders";
import type { FullOrderDetail } from "@/features/admin/types";
import { extractErrorMessage } from "@/lib/utils/error-handler";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  // React Query hooks
  const { data: order, isLoading, error } = useAdminOrderQuery(orderId);

  const updateStatusMutation = useUpdateOrderStatusMutation();

  // Handle error state
  if (error && !isLoading) {
    toast.error(extractErrorMessage(error, "Order not found"));
    router.push("/admin/orders");
    return null;
  }

  const handleStatusUpdate = async (
    status: FullOrderDetail["status"],
    note?: string
  ) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        payload: { status },
      });
      toast.success("Order status updated successfully");
    } catch (error) {
      toast.error(
        extractErrorMessage(
          error,
          "Failed to update order status. Please try again."
        )
      );
      throw error;
    }
  };

  if (isLoading) {
    return <LoadingSpinner variant="full" />;
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/admin/orders">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Order Detail */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <OrderDetail
          order={order}
          onStatusUpdate={handleStatusUpdate}
          isUpdating={updateStatusMutation.isPending}
        />
      </div>
    </div>
  );
}
