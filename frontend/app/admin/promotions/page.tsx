"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  ChevronDown,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Tag,
  Calendar,
  Percent,
  CircleDollarSign,
  Ticket,
  CheckCircle2,
  XCircle,
  BarChart3,
  Package,
  Layers,
  Megaphone
} from "lucide-react";
import { getAllPromotions } from "@/lib/mock-data/mock-data";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { format } from "date-fns";

type SortOption = "name-asc" | "name-desc" | "value-desc" | "newest";

export default function PromotionsAdminPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const promotions = useMemo(() => getAllPromotions(), []);

  const filteredPromotions = useMemo(() => {
    let result = promotions.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );

    if (statusFilter === "active") {
      result = result.filter(p => p.isActive);
    } else if (statusFilter === "inactive") {
      result = result.filter(p => !p.isActive);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc": return a.name.localeCompare(b.name);
        case "name-desc": return b.name.localeCompare(a.name);
        case "value-desc": return b.value - a.value;
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default: return 0;
      }
    });

    return result;
  }, [promotions, search, sortBy, statusFilter]);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this promotion?")) {
      toast.success("Promotion deleted (mock)");
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Heading level="h2">Promotions</Heading>
          <Text className="text-warm-gray-500">
            Create and manage automatic discounts for products and categories.
          </Text>
        </div>
        <Link href="/admin/promotions/new">
          <Button className="rounded-lg shadow-md hover:shadow-lg transition-all duration-200 bg-primary-600 hover:bg-primary-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Promotion
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
                placeholder="Search by name or description..."
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
                <DropdownMenuRadioGroup value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                  <DropdownMenuRadioItem value="all" className="rounded-lg cursor-pointer py-2.5">
                    All Promotions
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
              {filteredPromotions.length} promotions found
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
                  <DropdownMenuRadioItem value="name-asc" className="rounded-lg cursor-pointer py-2.5">
                    <SortAsc className="w-4 h-4 mr-2 text-warm-gray-400" />
                    <span>Name (A-Z)</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="value-desc" className="rounded-lg cursor-pointer py-2.5">
                    <Percent className="w-4 h-4 mr-2 text-warm-gray-400" />
                    <span>Highest Discount</span>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[400px] bg-white">
          {filteredPromotions.length === 0 ? (
            <div className="py-32 text-center">
              <Megaphone className="w-16 h-16 text-warm-gray-100 mx-auto mb-4" />
              <Text className="text-warm-gray-500 font-medium text-lg">No promotions found</Text>
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
                <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider w-1/4">Promotion Details</Text>
                <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider w-1/6 text-center">Discount</Text>
                <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider w-1/6 text-center">Scope</Text>
                <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider w-1/6 text-center">Validity</Text>
                <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider w-1/12 text-center">Status</Text>
                <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider w-1/12 text-right">Action</Text>
              </div>

              {filteredPromotions.map((promo) => (
                <div key={promo.id} className="group flex items-center py-5 px-6 hover:bg-warm-gray-50 transition-all duration-200">
                  <div className="w-1/4 flex items-center gap-4 min-w-0">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105",
                      promo.isActive ? "bg-primary-50 text-primary-600" : "bg-warm-gray-100 text-warm-gray-400"
                    )}>
                      <Megaphone className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Text className="font-bold text-warm-gray-900 text-sm truncate uppercase tracking-wider">
                          {promo.name}
                        </Text>
                      </div>
                      <Text className="text-xs text-warm-gray-500 line-clamp-1">
                        {promo.description}
                      </Text>
                    </div>
                  </div>

                  <div className="w-1/6 text-center">
                    <div className="inline-flex flex-col items-center">
                      <Text className="font-bold text-primary-700 text-lg leading-none">
                        {promo.type === "PERCENTAGE" ? `${promo.value}%` : `$${promo.value}`}
                      </Text>
                      <Text className="text-[10px] text-warm-gray-400 mt-1 uppercase font-semibold">
                        {promo.type === "PERCENTAGE" ? "Off Items" : "Flat Discount"}
                      </Text>
                    </div>
                  </div>

                  <div className="w-1/6 text-center">
                    <div className="flex flex-col gap-1 items-center">
                      {promo.productIds && promo.productIds.length > 0 && (
                        <Badge variant="outline" className="text-[10px] py-0 h-5 border-warm-gray-200">
                          <Package className="w-3 h-3 mr-1 opacity-60" /> {promo.productIds.length} Products
                        </Badge>
                      )}
                      {promo.categoryIds && promo.categoryIds.length > 0 && (
                        <Badge variant="outline" className="text-[10px] py-0 h-5 border-warm-gray-200">
                          <Layers className="w-3 h-3 mr-1 opacity-60" /> {promo.categoryIds.length} Categories
                        </Badge>
                      )}
                      {(!promo.productIds || promo.productIds.length === 0) && (!promo.categoryIds || promo.categoryIds.length === 0) && (
                        <Text className="text-[10px] text-warm-gray-400 italic font-medium tracking-wide uppercase">No Scope Set</Text>
                      )}
                    </div>
                  </div>

                  <div className="w-1/6 text-center">
                    <div className="flex flex-col gap-1 items-center">
                      <div className="flex items-center gap-1.5 text-xs text-warm-gray-600">
                        <Calendar className="w-3 h-3 text-warm-gray-400" />
                        <span>{promo.startsAt ? format(new Date(promo.startsAt), "MMM d, yyyy") : "No start"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-warm-gray-400">
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                        <span>{promo.expiresAt ? format(new Date(promo.expiresAt), "MMM d, yyyy") : "No expiry"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-1/12 text-center">
                    <Badge
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border shadow-sm",
                        promo.isActive
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                      )}
                    >
                      {promo.isActive ? (
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
                          <Link href={`/admin/promotions/${promo.id}/edit`} className="rounded-lg cursor-pointer flex items-center gap-2 px-3 py-2.5">
                            <Edit2 className="w-4 h-4 text-warm-gray-400" />
                            <span className="text-sm">Edit Promotion</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg cursor-pointer flex items-center gap-2 px-3 py-2.5">
                          <BarChart3 className="w-4 h-4 text-warm-gray-400" />
                          <span className="text-sm">Performance</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-warm-gray-100" />
                        <DropdownMenuItem
                          onClick={() => handleDelete(promo.id)}
                          className="rounded-lg cursor-pointer flex items-center gap-2 px-3 py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Delete Promotion</span>
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
    </div>
  );
}
