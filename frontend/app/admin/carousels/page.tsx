// Admin page to manage homepage carousel slides.
"use client";

import { CarouselManager } from "@/features/admin/components/carousels/CarouselManager";

export default function AdminCarouselsPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Carousel & Banner Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage hero carousels, product carousels, and custom banners
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <CarouselManager />
      </div>
    </div>
  );
}
