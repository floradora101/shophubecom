// Controller component for managing carousel slides.
"use client";

import { useState, useEffect } from "react";
import { Plus, GripVertical, Edit, Trash2, Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CarouselTypeSelector } from "./CarouselTypeSelector";
import { CarouselSlideForm } from "./CarouselSlideForm";
import { adminApi } from "@/lib/data/mockAdmin";
import type {
  CarouselType,
  CarouselSlide,
  CustomBanner,
} from "@/lib/types/carousel.types";
import { HeroCarouselColorSettings } from "./HeroCarouselColorSettings";

type TabType = "carousels" | "banners";

export function CarouselManager() {
  const [activeTab, setActiveTab] = useState<TabType>("carousels");
  const [carouselTypes, setCarouselTypes] = useState<CarouselType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [banners, setBanners] = useState<CustomBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSlideForm, setShowSlideForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<CustomBanner | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTypeId) {
      loadSlides(selectedTypeId);
    }
  }, [selectedTypeId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [types, bannersData] = await Promise.all([
        adminApi.getCarouselTypes(),
        adminApi.getCustomBanners(),
      ]);
      setCarouselTypes(types);
      setBanners(bannersData);
      if (types.length > 0 && !selectedTypeId) {
        setSelectedTypeId(types[0].id);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSlides = async (typeId: string) => {
    try {
      const slidesData = await adminApi.getCarouselSlides(typeId);
      setSlides(slidesData.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error("Failed to load slides:", error);
    }
  };

  const handleCreateSlide = async (data: Partial<CarouselSlide>) => {
    if (!selectedTypeId) return;
    const newSlide = await adminApi.createCarouselSlide(selectedTypeId, {
      ...data,
      order: slides.length + 1,
    });
    await loadSlides(selectedTypeId);
    setShowSlideForm(false);
  };

  const handleUpdateSlide = async (data: Partial<CarouselSlide>) => {
    if (!editingSlide) return;
    await adminApi.updateCarouselSlide(editingSlide.id, data);
    await loadSlides(selectedTypeId!);
    setEditingSlide(null);
  };

  const handleDeleteSlide = async (slideId: string) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;
    await adminApi.deleteCarouselSlide(slideId);
    await loadSlides(selectedTypeId!);
  };

  const handleToggleSlideActive = async (slide: CarouselSlide) => {
    await adminApi.updateCarouselSlide(slide.id, {
      isActive: !slide.isActive,
    });
    await loadSlides(selectedTypeId!);
  };

  const handleReorderSlides = async (newOrder: CarouselSlide[]) => {
    // In a real app, this would use drag-and-drop
    // For now, we'll just update the order numbers
    const slideIds = newOrder.map((s) => s.id);
    await adminApi.reorderCarouselSlides(selectedTypeId!, slideIds);
    setSlides(newOrder);
  };

  const handleCreateBanner = async (data: Partial<CustomBanner>) => {
    const newBanner = await adminApi.createCustomBanner(data);
    await loadData();
    setShowBannerForm(false);
  };

  const handleUpdateBanner = async (data: Partial<CustomBanner>) => {
    if (!editingBanner) return;
    await adminApi.updateCustomBanner(editingBanner.id, data);
    await loadData();
    setEditingBanner(null);
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    await adminApi.deleteCustomBanner(bannerId);
    await loadData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-1 flex gap-1">
        <button
          onClick={() => setActiveTab("carousels")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "carousels"
              ? "bg-primary-500 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          Carousels
        </button>
        <button
          onClick={() => setActiveTab("banners")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "banners"
              ? "bg-primary-500 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          Custom Banners
        </button>
      </div>

      {/* Carousels Tab */}
      {activeTab === "carousels" && (
        <div className="space-y-6">
          <CarouselTypeSelector
            types={carouselTypes}
            selectedTypeId={selectedTypeId}
            onSelect={setSelectedTypeId}
          />

          {selectedTypeId && (
            <>
              {/* Hero Carousel Color Settings */}
              {selectedTypeId === "carousel-1" && (
                <HeroCarouselColorSettings
                  type={carouselTypes.find((t) => t.id === selectedTypeId)!}
                  onUpdate={async (data) => {
                    await adminApi.updateCarouselType(selectedTypeId, data);
                    await loadData();
                  }}
                />
              )}

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Slides
                    {selectedTypeId && (
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        (
                        {
                          carouselTypes.find((t) => t.id === selectedTypeId)
                            ?.name
                        }
                        )
                      </span>
                    )}
                  </h3>
                  <Button
                    onClick={() => {
                      setEditingSlide(null);
                      setShowSlideForm(true);
                    }}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Slide
                  </Button>
                </div>

                {showSlideForm && (
                  <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <CarouselSlideForm
                      slide={editingSlide || undefined}
                      carouselTypeId={selectedTypeId}
                      onSave={
                        editingSlide ? handleUpdateSlide : handleCreateSlide
                      }
                      onCancel={() => {
                        setShowSlideForm(false);
                        setEditingSlide(null);
                      }}
                    />
                  </div>
                )}

                {slides.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No slides yet. Add your first slide to get started.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {slides.map((slide, index) => (
                      <div
                        key={slide.id}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-500">
                              #{index + 1}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {slide.title}
                            </span>
                            {!slide.isActive && (
                              <span className="text-xs text-gray-400">
                                (Inactive)
                              </span>
                            )}
                          </div>
                          {slide.description && (
                            <div className="text-xs text-gray-500">
                              {slide.description}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleSlideActive(slide)}
                            className="h-8 w-8"
                          >
                            {slide.isActive ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingSlide(slide);
                              setShowSlideForm(true);
                            }}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSlide(slide.id)}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Banners Tab */}
      {activeTab === "banners" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Custom Banners
              </h3>
              <Button
                onClick={() => {
                  setEditingBanner(null);
                  setShowBannerForm(true);
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Banner
              </Button>
            </div>

            {showBannerForm && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <BannerForm
                  banner={editingBanner || undefined}
                  onSave={
                    editingBanner ? handleUpdateBanner : handleCreateBanner
                  }
                  onCancel={() => {
                    setShowBannerForm(false);
                    setEditingBanner(null);
                  }}
                />
              </div>
            )}

            {banners.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No banners yet. Add your first banner to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {banner.title}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({banner.position})
                        </span>
                        {!banner.isActive && (
                          <span className="text-xs text-gray-400">
                            (Inactive)
                          </span>
                        )}
                      </div>
                      {banner.description && (
                        <div className="text-xs text-gray-500">
                          {banner.description}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingBanner(banner);
                          setShowBannerForm(true);
                        }}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Banner Form Component
function BannerForm({
  banner,
  onSave,
  onCancel,
}: {
  banner?: CustomBanner;
  onSave: (data: Partial<CustomBanner>) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: banner?.title || "",
    description: banner?.description || "",
    image: banner?.image || "",
    link: banner?.link || "",
    position: banner?.position || ("top" as const),
    isActive: banner?.isActive !== undefined ? banner.isActive : true,
    startDate: banner?.startDate
      ? new Date(banner.startDate).toISOString().split("T")[0]
      : "",
    endDate: banner?.endDate
      ? new Date(banner.endDate).toISOString().split("T")[0]
      : "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : undefined,
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : undefined,
      });
    } catch (error) {
      console.error("Failed to save banner:", error);
      alert("Failed to save banner. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URL <span className="text-red-500">*</span>
        </label>
        <Input
          type="url"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Position
          </label>
          <select
            value={formData.position}
            onChange={(e) =>
              setFormData({
                ...formData,
                position: e.target.value as CustomBanner["position"],
              })
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="top">Top</option>
            <option value="middle">Middle</option>
            <option value="bottom">Bottom</option>
            <option value="sidebar">Sidebar</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link
          </label>
          <Input
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="bannerIsActive"
          checked={formData.isActive}
          onChange={(e) =>
            setFormData({ ...formData, isActive: e.target.checked })
          }
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="bannerIsActive" className="text-sm text-gray-700">
          Active
        </label>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
        <Button type="submit" disabled={isSaving} className="flex-1">
          {isSaving ? "Saving..." : banner ? "Update Banner" : "Create Banner"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
