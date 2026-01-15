"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  ChevronDown,
  Layout,
  Eye,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  Copy,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Presentation,
  Grid,
  List as ListIcon
} from "lucide-react";
import { mockHeroSlides } from "@/dev/mocks/heroSlides.mock";
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
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { HeroSlideType } from "@/lib/types/heroSlides.types";

type SortOption = "priority-desc" | "priority-asc" | "type" | "status";
type ViewMode = "grid" | "list";

export default function HeroSlidesAdminPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("priority-desc");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedType, setSelectedType] = useState<string>("all");

  const slides = useMemo(() => mockHeroSlides, []);

  const filteredSlides = useMemo(() => {
    let result = slides.filter(s => {
      const headline = ("content" in s ? s.content?.headline : s.headline) || "";
      const id = s.id || "";
      return (
        headline.toLowerCase().includes(search.toLowerCase()) ||
        id.toLowerCase().includes(search.toLowerCase())
      );
    });

    if (selectedType !== "all") {
      result = result.filter(s => s.type === selectedType);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "priority-desc": return b.priority - a.priority;
        case "priority-asc": return a.priority - b.priority;
        case "type": return a.type.localeCompare(b.type);
        case "status": return (a.isActive === b.isActive) ? 0 : a.isActive ? -1 : 1;
        default: return 0;
      }
    });

    return result;
  }, [slides, search, sortBy, selectedType]);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this hero slide?")) {
      toast.success("Slide deleted (mock)");
    }
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("ID copied to clipboard");
  };

  const getSlideThumbnail = (slide: any) => {
    if (slide.media?.imageUrl) return slide.media.imageUrl;
    if (slide.media?.kind === "product") return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop";
    if (slide.type === "CATEGORY_SPOTLIGHT") return "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=100&h=100&fit=crop";
    if (slide.type === "EDITORS_PICK") return "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=100&h=100&fit=crop";
    return null;
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Heading level="h2">Hero Slides</Heading>
          <Text className="text-warm-gray-500">
            Manage your homepage billboard and promotional banners.
          </Text>
        </div>
        <Link href="/admin/hero-slides/new">
          <Button className="rounded-lg shadow-md hover:shadow-lg transition-all duration-200 bg-primary-600 hover:bg-primary-700 h-11">
            <Plus className="w-4 h-4 mr-2" />
            Add New Slide
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
                placeholder="Search slides by headline or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white border-warm-gray-200 focus:ring-primary-500 rounded-lg h-10"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-lg border-warm-gray-200 bg-white h-10 px-4 min-w-[160px] justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-warm-gray-400" />
                    <span className="text-sm font-medium text-warm-gray-700">
                      {selectedType === "all" ? "All Types" : selectedType.replace(/_/g, " ")}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-lg p-2 shadow-2xl border-warm-gray-100">
                <DropdownMenuLabel className="text-[10px] font-bold text-warm-gray-400 uppercase px-2 py-2">Filter Type</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-warm-gray-100" />
                <DropdownMenuRadioGroup value={selectedType} onValueChange={setSelectedType}>
                  <DropdownMenuRadioItem value="all" className="rounded-lg cursor-pointer py-2.5">All Types</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="PRODUCT_SPOTLIGHT" className="rounded-lg cursor-pointer py-2.5">Product Spotlight</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="OFFER" className="rounded-lg cursor-pointer py-2.5">Offer</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="TESTIMONIAL" className="rounded-lg cursor-pointer py-2.5">Testimonial</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="LANDSCAPE_IMAGE" className="rounded-lg cursor-pointer py-2.5">Landscape Image</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="CATEGORY_SPOTLIGHT" className="rounded-lg cursor-pointer py-2.5">Category Spotlight</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="EDITORS_PICK" className="rounded-lg cursor-pointer py-2.5">Editor&apos;s Pick</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-warm-gray-400 font-medium hidden md:block">
              {filteredSlides.length} slides found
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
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <DropdownMenuRadioItem value="priority-desc" className="rounded-lg cursor-pointer py-2.5">
                    <SortDesc className="w-4 h-4 mr-2 text-warm-gray-400" />
                    <span>Priority (High to Low)</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="priority-asc" className="rounded-lg cursor-pointer py-2.5">
                    <SortAsc className="w-4 h-4 mr-2 text-warm-gray-400" />
                    <span>Priority (Low to High)</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="type" className="rounded-lg cursor-pointer py-2.5">
                    <Layers className="w-4 h-4 mr-2 text-warm-gray-400" />
                    <span>Slide Type</span>
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
        <div className="min-h-[600px] bg-white">
          {filteredSlides.length === 0 ? (
            <div className="py-32 text-center">
              <Presentation className="w-16 h-16 text-warm-gray-100 mx-auto mb-4" />
              <Text className="text-warm-gray-500 font-medium text-lg">No slides found</Text>
              <Text className="text-warm-gray-400 text-sm mt-1">Try adjusting your search or filters.</Text>
            </div>
          ) : viewMode === "list" ? (
            <div className="divide-y divide-warm-gray-100">
              <div className="bg-warm-gray-50/50 border-b border-warm-gray-100 py-2.5 px-6 flex items-center justify-between">
                <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider flex-1">Slide Details</Text>
                <div className="flex items-center gap-10 w-2/5 justify-end pr-10">
                  <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider w-24 text-center">Status</Text>
                  <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider w-16 text-right">Priority</Text>
                  <Text className="text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider w-16 text-right">Action</Text>
                </div>
              </div>

              {filteredSlides.map((slide) => {
                const headline = ("content" in slide ? slide.content?.headline : slide.headline) || "Untitled Slide";
                const thumbnail = getSlideThumbnail(slide);

                return (
                  <div key={slide.id} className="group flex items-center py-4 px-6 hover:bg-warm-gray-50 transition-all duration-200">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative w-20 h-12 rounded-lg overflow-hidden border border-warm-gray-100 flex-shrink-0 bg-neutral-900 group-hover:shadow-md transition-shadow">
                        {thumbnail ? (
                          <Image
                            src={thumbnail}
                            alt={headline}
                            fill
                            className="object-cover opacity-80"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-warm-gray-600">
                            <Presentation className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <Text className="font-bold text-warm-gray-900 group-hover:text-primary-700 transition-colors text-sm truncate mb-0.5">
                          {headline}
                        </Text>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] py-0 h-4 bg-warm-gray-50 text-warm-gray-500 border-warm-gray-100 uppercase tracking-tight">
                            {slide.type.replace(/_/g, " ")}
                          </Badge>
                          <button
                            onClick={() => copyId(slide.id)}
                            className="flex items-center gap-1 text-[9px] text-warm-gray-400 hover:text-primary-600 transition-colors font-mono"
                          >
                            <Copy className="w-2.5 h-2.5" />
                            {slide.id.substring(0, 8)}...
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-10 w-2/5 justify-end">
                      <div className="w-24 flex justify-center">
                        {slide.isActive ? (
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
                          {slide.priority}
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
                              <Link href={`/admin/hero-slides/${slide.id}/edit`} className="rounded-lg cursor-pointer flex items-center gap-2 px-3 py-2.5">
                                <Edit2 className="w-4 h-4 text-warm-gray-400" />
                                <span className="text-sm">Edit Slide</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toast.info("Scheduling feature coming soon")}
                              className="rounded-lg cursor-pointer flex items-center gap-2 px-3 py-2.5"
                            >
                              <Calendar className="w-4 h-4 text-warm-gray-400" />
                              <span className="text-sm">Schedule</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-warm-gray-100" />
                            <DropdownMenuItem
                              onClick={() => handleDelete(slide.id)}
                              className="rounded-lg cursor-pointer flex items-center gap-2 px-3 py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="text-sm font-medium">Delete Slide</span>
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
              {filteredSlides.map((slide) => {
                const headline = ("content" in slide ? slide.content?.headline : slide.headline) || "Untitled Slide";
                const thumbnail = getSlideThumbnail(slide);

                return (
                  <Card key={slide.id} className="group overflow-hidden border-warm-gray-200 hover:shadow-xl transition-all duration-300 rounded-lg flex flex-col">
                    <div className="relative aspect-[21/9] bg-neutral-900">
                      {thumbnail ? (
                        <Image
                          src={thumbnail}
                          alt={headline}
                          fill
                          className="object-cover opacity-60 transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-warm-gray-700">
                          <Presentation className="w-8 h-8" />
                        </div>
                      )}

                      <div className="absolute top-2 left-2 flex flex-col gap-2">
                        <Badge className="bg-white/90 backdrop-blur-sm text-[8px] text-warm-gray-900 border-none shadow-sm uppercase px-1.5 py-0 h-4">
                          {slide.type.replace(/_/g, " ")}
                        </Badge>
                      </div>

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Link href={`/admin/hero-slides/${slide.id}/edit`}>
                          <Button size="sm" className="rounded-lg bg-white text-warm-gray-900 hover:bg-red-600 hover:text-white border-none h-8">
                            <Edit2 className="w-3 h-3 mr-2" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <Text className="font-bold text-warm-gray-900 truncate block text-xs flex-1">
                            {headline}
                          </Text>
                          <Text className="font-mono text-[10px] text-primary-600 font-bold">P{slide.priority}</Text>
                        </div>
                        <Text className="text-[10px] text-warm-gray-400 font-mono mt-0.5">{slide.id.substring(0, 12)}...</Text>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        {slide.isActive ? (
                          <div className="flex items-center gap-1.5 text-[10px] text-green-600 font-bold">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            ACTIVE
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[10px] text-warm-gray-400 font-bold">
                            <div className="w-1.5 h-1.5 rounded-full bg-warm-gray-300" />
                            INACTIVE
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-full hover:bg-red-50 text-warm-gray-300 hover:text-red-500 transition-colors"
                          onClick={() => handleDelete(slide.id)}
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
        </div>
      </Card>
    </div>
  );
}
