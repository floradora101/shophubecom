// Control for updating order status.
"use client";

import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FullOrderDetail } from "@/features/admin/types";

type OrderStatus = FullOrderDetail["status"];

interface OrderStatusUpdateProps {
  currentStatus: OrderStatus;
  onUpdate: (status: OrderStatus, note?: string) => Promise<void>;
  isUpdating?: boolean;
}

const statusOptions: Array<{
  value: OrderStatus;
  label: string;
  description: string;
}> = [
  {
    value: "PENDING",
    label: "Pending",
    description: "Order received, awaiting payment confirmation",
  },
  {
    value: "PROCESSING",
    label: "Processing",
    description: "Payment confirmed, preparing order",
  },
  {
    value: "SHIPPED",
    label: "Shipped",
    description: "Order has been shipped",
  },
  {
    value: "DELIVERED",
    label: "Delivered",
    description: "Order has been delivered",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
    description: "Order has been cancelled",
  },
];

export function OrderStatusUpdate({
  currentStatus,
  onUpdate,
  isUpdating: externalIsUpdating = false,
}: OrderStatusUpdateProps) {
  const [selectedStatus, setSelectedStatus] =
    useState<OrderStatus>(currentStatus);
  const [note, setNote] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Update selected status when currentStatus changes (e.g., after successful update)
  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  const handleUpdate = async () => {
    if (selectedStatus === currentStatus) {
      setShowForm(false);
      return;
    }

    try {
      await onUpdate(selectedStatus, note || undefined);
      setShowForm(false);
      setNote("");
      // Status will be updated via React Query cache invalidation
    } catch (error) {
      // Error is already handled in the parent component with toast
      // Just re-throw to let parent handle it
      throw error;
    }
  };

  const handleCancel = () => {
    setSelectedStatus(currentStatus);
    setNote("");
    setShowForm(false);
  };

  const isUpdating = externalIsUpdating;

  if (!showForm) {
    return (
      <Button
        variant="outline"
        onClick={() => setShowForm(true)}
        className="w-full sm:w-auto rounded-xl hover:shadow-md transition-all duration-300 hover:scale-105"
      >
        Update Status
      </Button>
    );
  }

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          New Status
        </label>
        <Select
          value={selectedStatus}
          onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedStatus !== currentStatus && (
          <p className="mt-1 text-xs text-gray-500">
            {statusOptions.find((o) => o.value === selectedStatus)?.description}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Note (optional)
        </label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Add a note about this status change..."
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleUpdate}
          disabled={isUpdating || selectedStatus === currentStatus}
          className="gap-2 rounded-xl hover:shadow-md transition-all duration-300 hover:scale-105"
        >
          {isUpdating ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Updating...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Update Status
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isUpdating}
          className="gap-2 rounded-xl hover:shadow-md transition-all duration-300 hover:scale-105"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
