"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SelectWithOptions as Select } from "@/components/ui/select";
import { Text } from "@/components/ui/typography";
import {
  listHeroSlides,
  deleteHeroSlide,
  type HeroSlide,
} from "../_lib/admin-data";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

type TypeFilter =
  | "all"
  | "PRODUCT_SPOTLIGHT"
  | "CATEGORY_SPOTLIGHT"
  | "OFFER"
  | "TESTIMONIAL"
  | "LANDSCAPE_IMAGE";
type StatusFilter = "all" | "active" | "scheduled" | "expired";

function getSlideStatus(slide: HeroSlide): "active" | "scheduled" | "expired" {
  const now = new Date();

  if (slide.endsAt && new Date(slide.endsAt) < now) {
    return "expired";
  }

  if (slide.startsAt && new Date(slide.startsAt) > now) {
    return "scheduled";
  }

  return "active";
}

function getStatusBadge(status: "active" | "scheduled" | "expired") {
  switch (status) {
    case "active":
      return <Badge className="bg-success text-white">Active</Badge>;
    case "scheduled":
      return <Badge className="bg-warning text-white">Scheduled</Badge>;
    case "expired":
      return <Badge variant="secondary">Expired</Badge>;
  }
}

function getTypeBadge(type: HeroSlide["type"]) {
  const labels = {
    PRODUCT_SPOTLIGHT: "Product",
    CATEGORY_SPOTLIGHT: "Category",
    OFFER: "Offer",
    TESTIMONIAL: "Testimonial",
    LANDSCAPE_IMAGE: "Landscape",
  };

  return <Badge variant="outline">{labels[type]}</Badge>;
}

export default function HeroSlidesPage() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<HeroSlide | null>(null);

  const allSlides = useMemo(() => listHeroSlides(), []);

  const filteredSlides = useMemo(() => {
    return allSlides.filter((slide) => {
      const matchesType = typeFilter === "all" || slide.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" || getSlideStatus(slide) === statusFilter;

      return matchesType && matchesStatus;
    });
  }, [allSlides, typeFilter, statusFilter]);

  const handleDelete = (slide: HeroSlide) => {
    setSlideToDelete(slide);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (slideToDelete) {
      deleteHeroSlide(slideToDelete.id);
      setDeleteDialogOpen(false);
      setSlideToDelete(null);
      // In a real app, you'd trigger a re-fetch here
      window.location.reload();
    }
  };

  const getSlidePreview = (slide: HeroSlide) => {
    return (
      <div className="flex items-center gap-3">
        {slide.media.kind === "image" && slide.media.imageUrl ? (
          <Image
            src={slide.media.imageUrl}
            alt={slide.media.alt || ""}
            width={64}
            height={64}
            className="object-cover rounded-lg"
            sizes="64px"
          />
        ) : (
          <div className="w-16 h-16 bg-warm-gray-100 rounded-lg flex items-center justify-center">
            <Image className="h-6 w-6 text-warm-gray-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Text className="font-medium text-warm-gray-900 truncate">
            {slide.headline}
          </Text>
          <Text variant="meta" className="text-warm-gray-600 truncate">
            {slide.description}
          </Text>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hero Slides"
        description="Manage homepage hero slides and banners"
        actions={
          <Link href="/admin/hero-slides/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Slide
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <Card padding="md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as TypeFilter)}
              options={[
                { value: "all", label: "All Types" },
                { value: "PRODUCT_SPOTLIGHT", label: "Product Spotlight" },
                { value: "CATEGORY_SPOTLIGHT", label: "Category Spotlight" },
                { value: "OFFER", label: "Offer" },
                { value: "TESTIMONIAL", label: "Testimonial" },
                { value: "LANDSCAPE_IMAGE", label: "Landscape Image" },
              ]}
            />

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              options={[
                { value: "all", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "scheduled", label: "Scheduled" },
                { value: "expired", label: "Expired" },
              ]}
            />
          </div>

          <Text variant="meta" className="text-warm-gray-600">
            {filteredSlides.length} slides
          </Text>
        </div>
      </Card>

      {/* Slides List */}
      <div className="space-y-4">
        {filteredSlides.length === 0 ? (
          <Card padding="lg">
            <div className="text-center py-8">
              <Image className="h-12 w-12 text-warm-gray-400 mx-auto mb-4" />
              <Text className="text-lg font-medium text-warm-gray-900 mb-2">
                No hero slides found
              </Text>
              <Text className="text-warm-gray-600 mb-4">
                {typeFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your filters."
                  : "Get started by creating your first hero slide."}
              </Text>
              <Link href="/admin/hero-slides/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Slide
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          filteredSlides
            .sort((a, b) => b.priority - a.priority) // Sort by priority descending
            .map((slide) => {
              const status = getSlideStatus(slide);
              return (
                <Card key={slide.id} padding="md" hover>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {getSlidePreview(slide)}
                      <div className="flex items-center gap-3 mt-3">
                        {getTypeBadge(slide.type)}
                        {getStatusBadge(status)}
                        <Text variant="meta" className="text-warm-gray-500">
                          Priority: {slide.priority}
                        </Text>
                        {slide.startsAt && (
                          <Text variant="meta" className="text-warm-gray-500">
                            {status === "scheduled" ? "Starts" : "Started"}:{" "}
                            {new Date(slide.startsAt).toLocaleDateString()}
                          </Text>
                        )}
                        {slide.endsAt && (
                          <Text variant="meta" className="text-warm-gray-500">
                            {status === "expired" ? "Ended" : "Ends"}:{" "}
                            {new Date(slide.endsAt).toLocaleDateString()}
                          </Text>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="More actions">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/hero-slides/${slide.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(slide)}
                          className="text-error hover:text-error hover:bg-error/10"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              );
            })
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Hero Slide</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this hero slide? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-error hover:bg-error/90"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
