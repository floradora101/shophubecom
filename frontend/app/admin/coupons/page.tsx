"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  ChevronDown,
  ArrowUpDown,
  SortAsc,
  Tag,
  Calendar,
  Percent,
  Ticket,
  CheckCircle2,
  XCircle,
  Copy,
  BarChart3,
} from "lucide-react";
import { AdminLoadingState } from "../_components/AdminLoadingState";
import { Heading, Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { format } from "date-fns";
import { useCouponsQuery, useDeleteCouponMutation } from "@/features/coupons/queries";
import { USE_MOCKS } from "@/lib/flags";

type SortOption = "code-asc" | "code-desc" | "value-desc" | "usage-desc" | "newest";
type CouponStatusFilter = "all" | "active" | "inactive";

export default function CouponsAdminPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [statusFilter, setStatusFilter] = useState<CouponStatusFilter>("all");

  const { data: couponsData, isLoading } = useCouponsQuery(
    {
      search: search || undefined,
      isActive: statusFilter === "all" ? undefined : statusFilter === "active",
      page: 1,
      limit: 100, // Get all for client-side sorting
    }
  );

  const deleteMutation = useDeleteCouponMutation();

  const filteredCoupons = (() => {
    let result = [...(couponsData?.data ?? [])];

    // Additional client-side filtering if needed
    if (search) {
      result = result.filter(c =>
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        (c.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
      );
    }

    if (statusFilter === "active") {
      result = result.filter(c => c.isActive);
    } else if (statusFilter === "inactive") {
      result = result.filter(c => !c.isActive);
    }

    // Client-side sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "code-asc": return a.code.localeCompare(b.code);
        case "code-desc": return b.code.localeCompare(a.code);
        case "value-desc": return b.value - a.value;
        case "usage-desc": return (b.usedCount || 0) - (a.usedCount || 0);
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default: return 0;
      }
    });

    return result;
  })();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (USE_MOCKS) {
      toast.info("Coupon management is read-only while mock mode is enabled.");
      return;
    }
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteMutation.mutateAsync(deleteId);
        setDeleteId(null);
      } catch (error) {
        console.error("Failed to delete coupon:", error);
      }
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    if (USE_MOCKS) {
      e.preventDefault();
      toast.info("Coupon editing is disabled while mock mode is enabled.");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied!");
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Heading level="h2">Coupons & Promotions</Heading>
          <Text className="text-warm-gray-500">
            Create and manage discount codes for your customers.
          </Text>
        </div>
        <Link href="/admin/coupons/new">
          <Button className="rounded-lg shadow-md hover:shadow-lg transition-all duration-200 bg-primary-600 hover:bg-primary-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Coupon
          </Button>
        </Link>
      </div>

      <Card className="border-warm-gray-200 shadow-sm overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="p-4 border-b border-warm-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-warm-gray-50/30">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray-400" />
              <Input
                placeholder="Search by code or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white border-warm-gray-200 focus:ring-primary-500 rounded-lg h-10"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-lg border-warm-gray-200 bg-white h-10 px-4 min-w-[140px] justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-warm-gray-400" />
                    <span className="text-sm font-medium text-warm-gray-700">
                      {statusFilter === "all" ? "All Status" : statusFilter === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-lg p-2 shadow-2xl border-warm-gray-100">
                <DropdownMenuLabel className="text-[10px] font-bold text-warm-gray-400 uppercase px-2 py-2">Filter Status</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-warm-gray-100" />
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as CouponStatusFilter)
                  }
                >
                  <DropdownMenuRadioItem value="all" className="rounded-lg cursor-pointer py-2.5">
                    All Coupons
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="active" className="rounded-lg cursor-pointer py-2.5 text-green-600">
                    Active Only
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="inactive" className="rounded-lg cursor-pointer py-2.5 text-red-600">
                    Inactive Only
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-warm-gray-400 font-medium hidden md:block">
              {filteredCoupons.length} {filteredCoupons.length === 1 ? 'coupon' : 'coupons'} found
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-lg border-warm-gray-200 bg-white h-10 px-4">
                  <ArrowUpDown className="w-4 h-4 mr-2 text-warm-gray-400" />
                  <span className="text-sm font-medium text-warm-gray-700">Sort By</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-lg p-2 shadow-2xl border-warm-gray-100">
                <DropdownMenuLabel className="text-[10px] font-bold text-warm-gray-400 uppercase px-2 py-2">Sort Results</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-warm-gray-100" />
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <DropdownMenuRadioItem value="newest" className="rounded-lg cursor-pointer py-2.5">
                    <Calendar className="w-4 h-4 mr-2 text-warm-gray-400" />
                    <span>Newest Created</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="code-asc" className="rounded-lg cursor-pointer py-2.5">
                    <SortAsc className="w-4 h-4 mr-2 text-warm-gray-400" />
                    <span>Code (A-Z)</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="value-desc" className="rounded-lg cursor-pointer py-2.5">
                    <Percent className="w-4 h-4 mr-2 text-warm-gray-400" />
                    <span>Highest Discount</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="usage-desc" className="rounded-lg cursor-pointer py-2.5">
                    <BarChart3 className="w-4 h-4 mr-2 text-warm-gray-400" />
                    <span>Most Used</span>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[400px] bg-white">
          {isLoading ? (
            <AdminLoadingState message="Loading coupons..." />
          ) : filteredCoupons.length === 0 ? (
            <div className="py-32 text-center">
              <Ticket className="w-16 h-16 text-warm-gray-100 mx-auto mb-4" />
              <Text className="text-warm-gray-500 font-medium text-lg">No coupons found</Text>
              <Text className="text-warm-gray-400 text-sm mt-1">Try adjusting your search or filters.</Text>
              <Button
                variant="outline"
                className="mt-6 rounded-lg border-warm-gray-200"
                onClick={() => {setSearch(""); setStatusFilter("all");}}
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-warm-gray-100">
              <div className="bg-warm-gray-50/50 border-b border-warm-gray-100 py-2.5 px-6 flex items-center">
                <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider w-1/4">Coupon Details</Text>
                <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider w-1/6 text-center">Discount</Text>
                <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider w-1/6 text-center">Usage</Text>
                <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider w-1/6 text-center">Validity</Text>
                <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider w-1/12 text-center">Status</Text>
                <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider w-1/12 text-right">Action</Text>
              </div>

              {filteredCoupons.map((coupon) => (
                <div key={coupon.id} className="group flex items-center py-5 px-6 hover:bg-warm-gray-50 transition-all duration-200">
                  <div className="w-1/4 flex items-center gap-4 min-w-0">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105",
                      coupon.isActive ? "bg-primary-50 text-primary-600" : "bg-warm-gray-100 text-warm-gray-400"
                    )}>
                      <Ticket className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Text className="font-bold text-warm-gray-900 text-sm truncate uppercase tracking-wider">
                          {coupon.code}
                        </Text>
                        <button
                          onClick={() => copyCode(coupon.code)}
                          className="p-1 rounded hover:bg-warm-gray-200 text-warm-gray-400 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <Text className="text-xs text-warm-gray-500 line-clamp-1">
                        {coupon.description || "No description"}
                      </Text>
                    </div>
                  </div>

                  <div className="w-1/6 text-center">
                    <div className="inline-flex flex-col items-center">
                      <Text className="font-bold text-primary-700 text-lg leading-none">
                        {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `$${coupon.value}`}
                      </Text>
                      <Text className="text-[10px] text-warm-gray-400 mt-1 uppercase font-semibold">
                        {coupon.type === "PERCENTAGE" ? "Off Total" : "Flat Discount"}
                      </Text>
                    </div>
                  </div>

                  <div className="w-1/6 text-center">
                    <div className="inline-flex flex-col items-center">
                      <Text className="font-bold text-warm-gray-900 text-sm">
                        {coupon.usedCount} <span className="text-warm-gray-400 font-normal">/ {coupon.usageLimit || "∞"}</span>
                      </Text>
                      <div className="w-20 h-1.5 bg-warm-gray-100 rounded-full mt-2 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            coupon.usageLimit ? (coupon.usedCount / coupon.usageLimit > 0.9 ? "bg-red-500" : "bg-primary-500") : "bg-primary-500"
                          )}
                          style={{ width: coupon.usageLimit ? `${Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)}%` : "100%" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="w-1/6 text-center">
                    <div className="flex flex-col gap-1 items-center">
                      <div className="flex items-center gap-1.5 text-xs text-warm-gray-600">
                        <Calendar className="w-3 h-3 text-warm-gray-400" />
                        <span>{coupon.startsAt ? format(new Date(coupon.startsAt), "MMM d, yyyy") : "No start"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-warm-gray-400">
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                        <span>{coupon.expiresAt ? format(new Date(coupon.expiresAt), "MMM d, yyyy") : "No expiry"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-1/12 text-center">
                    <Badge
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border shadow-sm",
                        coupon.isActive
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                      )}
                    >
                      {coupon.isActive ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> ACTIVE
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> INACTIVE
                        </span>
                      )}
                    </Badge>
                  </div>

                  <div className="w-1/12 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-warm-gray-100">
                          <MoreHorizontal className="h-4 w-4 text-warm-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-lg p-2 shadow-2xl border-warm-gray-100">
                        <DropdownMenuLabel className="text-[10px] font-bold text-warm-gray-400 uppercase px-2 py-1.5">Manage</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link
                            href={USE_MOCKS ? "#" : `/admin/coupons/${coupon.id}/edit`}
                            className="rounded-lg cursor-pointer flex items-center gap-2 px-3 py-2.5"
                            onClick={handleEditClick}
                          >
                            <Edit2 className="w-4 h-4 text-warm-gray-400" />
                            <span className="text-sm">Edit Coupon</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg cursor-pointer flex items-center gap-2 px-3 py-2.5">
                          <BarChart3 className="w-4 h-4 text-warm-gray-400" />
                          <span className="text-sm">View Analytics</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-warm-gray-100" />
                        <DropdownMenuItem
                          onClick={() => handleDelete(coupon.id)}
                          className="rounded-lg cursor-pointer flex items-center gap-2 px-3 py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Delete Coupon</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete coupon"
        description="Are you sure you want to delete this coupon?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
