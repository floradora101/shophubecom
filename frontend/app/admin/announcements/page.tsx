"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  ChevronDown,
  Megaphone,
  Bell,
  CheckCircle2,
  XCircle,
  Copy,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  List as ListIcon,
  Grid,
  Truck,
  Sparkles,
  Zap,
  Info,
  Tag,
  Gift
} from "lucide-react";
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
import { AnnouncementIconType } from "@/lib/types/announcements.types";
import { useAnnouncementsQuery, useDeleteAnnouncementMutation } from "@/features/announcements/queries";
import { Loader2, AlertCircle } from "lucide-react";

type SortOption = "priority-desc" | "priority-asc" | "status";
type ViewMode = "list" | "grid";

const iconMap = {
  Truck: Truck,
  Sparkles: Sparkles,
  Zap: Zap,
  Info: Info,
  Bell: Bell,
  Tag: Tag,
  Gift: Gift
};

const ANNOUNCEMENTS_PER_PAGE = 20;

export default function AnnouncementsAdminPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("priority-desc");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [page, setPage] = useState(1);

  const apiFilters = useMemo(() => {
    const filters: Record<string, unknown> = {
      page,
      limit: ANNOUNCEMENTS_PER_PAGE,
    };
    if (search) filters.search = search;
    switch (sortBy) {
      case "priority-desc":
        filters.sortBy = "priority";
        filters.sortOrder = "desc";
        break;
      case "priority-asc":
        filters.sortBy = "priority";
        filters.sortOrder = "asc";
        break;
      case "status":
        filters.sortBy = "createdAt";
        filters.sortOrder = "desc";
        break;
    }
    return filters;
  }, [search, sortBy, page]);

  const { data, isLoading, error } = useAnnouncementsQuery(apiFilters);
  const deleteMutation = useDeleteAnnouncementMutation();

  const announcements = data?.data || [];

  // Client-side filtering for status (API doesn't support it yet)
  const filteredAnnouncements = useMemo(() => {
    let result = [...announcements];

    // Additional client-side sorting for status
    if (sortBy === "status") {
      result.sort((a, b) => (a.isActive === b.isActive) ? 0 : a.isActive ? -1 : 1);
    }

    return result;
  }, [announcements, sortBy]);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      deleteMutation.mutate(id);
    }
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("ID copied to clipboard");
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Heading level="h2">Announcements</Heading>
          <Text className="text-warm-gray-500">
            Manage the scrolling announcement bar at the top of your shop.
          </Text>
        </div>
        <Link href="/admin/announcements/new">
          <Button className="rounded-lg shadow-md hover:shadow-lg transition-all duration-200 bg-primary-600 hover:bg-primary-700 h-11">
            <Plus className="w-4 h-4 mr-2" />
            Add New Announcement
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
                placeholder="Search announcements..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10 bg-white border-warm-gray-200 focus:ring-primary-500 rounded-lg h-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-warm-gray-400 font-medium hidden md:block">
              {data?.total ?? filteredAnnouncements.length} announcements
            </div>

            <div className="flex items-center border border-warm-gray-200 rounded-lg bg-white p-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-8 w-8 p-0 rounded-lg", viewMode === "list" && "bg-warm-gray-100 text-primary-600")}
                onClick={() => setViewMode("list")}
              >
                <ListIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-8 w-8 p-0 rounded-lg", viewMode === "grid" && "bg-warm-gray-100 text-primary-600")}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-lg border-warm-gray-200 bg-white h-10 px-4">
                  <ArrowUpDown className="w-4 h-4 mr-2 text-warm-gray-400" />
                  <span className="text-sm font-medium text-warm-gray-700">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-lg p-2 shadow-2xl border-warm-gray-100">
                <DropdownMenuLabel className="text-[10px] font-bold text-warm-gray-400 uppercase px-2 py-2">Sort Results</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-warm-gray-100" />
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => {
              setSortBy(v as SortOption);
              setPage(1);
            }}>
                  <DropdownMenuRadioItem value="priority-desc" className="rounded-lg cursor-pointer py-2.5">
                    <SortDesc className="w-4 h-4 mr-2 text-warm-gray-400" />
                    <span>Priority (High to Low)</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="priority-asc" className="rounded-lg cursor-pointer py-2.5">
                    <SortAsc className="w-4 h-4 mr-2 text-warm-gray-400" />
                    <span>Priority (Low to High)</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="status" className="rounded-lg cursor-pointer py-2.5">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-warm-gray-400" />
                    <span>Active Status</span>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[400px] bg-white">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              <Text className="text-warm-gray-500">Loading announcements...</Text>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <Text className="text-warm-gray-500">Failed to load announcements</Text>
              <Text className="text-warm-gray-400 text-sm">Please try refreshing the page</Text>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="py-32 text-center">
              <Megaphone className="w-16 h-16 text-warm-gray-100 mx-auto mb-4" />
              <Text className="text-warm-gray-500 font-medium text-lg">No announcements found</Text>
              <Text className="text-warm-gray-400 text-sm mt-1">Try adjusting your search.</Text>
            </div>
          ) : viewMode === "list" ? (
            <div className="divide-y divide-warm-gray-100">
              <div className="bg-warm-gray-50/50 border-b border-warm-gray-100 py-2.5 px-6 flex items-center justify-between">
                <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider flex-1">Announcement Details</Text>
                <div className="flex items-center gap-10 w-2/5 justify-end pr-10">
                  <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider w-24 text-center">Status</Text>
                  <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider w-16 text-right">Priority</Text>
                  <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider w-16 text-right">Action</Text>
                </div>
              </div>

              {filteredAnnouncements.map((announcement) => {
                const Icon = iconMap[announcement.icon] || Info;

                return (
                  <div key={announcement.id} className="group flex items-center py-4 px-6 hover:bg-warm-gray-50 transition-all duration-200">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <Text className="font-bold text-warm-gray-900 group-hover:text-primary-700 transition-colors text-sm truncate mb-0.5">
                          {announcement.text}
                        </Text>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] py-0 h-4 bg-warm-gray-50 text-warm-gray-500 border-warm-gray-100 uppercase tracking-tight">
                            Highlight: {announcement.highlight}
                          </Badge>
                          <button
                            onClick={() => copyId(announcement.id)}
                            className="flex items-center gap-1 text-[9px] text-warm-gray-400 hover:text-primary-600 transition-colors font-mono"
                          >
                            <Copy className="w-2.5 h-2.5" />
                            {announcement.id}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-10 w-2/5 justify-end">
                      <div className="w-24 flex justify-center">
                        {announcement.isActive ? (
                          <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50 gap-1.5 py-0.5 px-2">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50 gap-1.5 py-0.5 px-2">
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </Badge>
                        )}
                      </div>

                      <div className="w-16 text-right">
                        <Text className="font-mono font-bold text-warm-gray-900 text-sm">
                          {announcement.priority}
                        </Text>
                      </div>

                      <div className="w-16 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-warm-gray-100">
                              <MoreHorizontal className="h-4 w-4 text-warm-gray-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-lg p-2 shadow-2xl border-warm-gray-100">
                            <DropdownMenuLabel className="text-[10px] font-bold text-warm-gray-400 uppercase px-2 py-1.5">Manage</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/announcements/${announcement.id}/edit`} className="rounded-lg cursor-pointer flex items-center gap-2 px-3 py-2.5">
                                <Edit2 className="w-4 h-4 text-warm-gray-400" />
                                <span className="text-sm">Edit Announcement</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-warm-gray-100" />
                            <DropdownMenuItem
                              onClick={() => handleDelete(announcement.id)}
                              className="rounded-lg cursor-pointer flex items-center gap-2 px-3 py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="text-sm font-medium">Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Grid View */
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAnnouncements.map((announcement) => {
                const Icon = iconMap[announcement.icon] || Info;

                return (
                  <Card key={announcement.id} className="group overflow-hidden border-warm-gray-200 hover:shadow-xl transition-all duration-300 rounded-lg flex flex-col p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600">
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge className="bg-white/90 backdrop-blur-sm text-[8px] text-warm-gray-900 border-warm-gray-200 uppercase px-1.5 py-0 h-4">
                        P{announcement.priority}
                      </Badge>
                    </div>

                    <div className="flex-1 space-y-2">
                      <Text className="font-bold text-warm-gray-900 text-sm leading-tight line-clamp-2">
                        {announcement.text}
                      </Text>
                      <Badge variant="outline" className="text-[10px] bg-warm-gray-50/50 text-warm-gray-500 border-warm-gray-100">
                        {announcement.highlight}
                      </Badge>
                    </div>

                    <div className="pt-4 border-t border-warm-gray-50 flex items-center justify-between">
                      {announcement.isActive ? (
                        <div className="flex items-center gap-1.5 text-[10px] text-green-600 font-bold uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          Active
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] text-warm-gray-400 font-bold uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-warm-gray-300" />
                          Inactive
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Link href={`/admin/announcements/${announcement.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-primary-50 hover:text-primary-600 text-warm-gray-400 transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full hover:bg-red-50 text-warm-gray-400 hover:text-red-500 transition-colors"
                          onClick={() => handleDelete(announcement.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t border-warm-gray-100 flex items-center justify-between bg-warm-gray-50/30">
            <Text className="text-xs text-warm-gray-500">
              Page {page} of {data.totalPages} · {data.total} total
            </Text>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                className="rounded-lg"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages || isLoading}
                className="rounded-lg"
              >
                Next
              </Button>
            </div>
          </div>
        )}
        </div>
      </Card>
    </div>
  );
}
