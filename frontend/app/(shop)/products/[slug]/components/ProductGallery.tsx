// Professional Product Gallery - Media Frame Style
"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  isOutOfStock?: boolean;
  isUnavailable?: boolean;
}

export function ProductGallery({
  images,
  productName,
  isOutOfStock,
  isUnavailable,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handlePrevious = useCallback(() => {
    if (images.length <= 1) return;
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handleThumbnailClick = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handleFullscreenToggle = useCallback(() => {
    setShowFullscreen(!showFullscreen);
  }, [showFullscreen]);

  // Touch handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && activeIndex < images.length - 1) {
      handleNext();
    }
    if (isRightSwipe && activeIndex > 0) {
      handlePrevious();
    }
  };

  if (images.length === 0) {
    return (
      <div className="aspect-4/5 rounded-2xl bg-slate-100 flex items-center justify-center">
        <span className="text-slate-400 text-sm">No image available</span>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[420px] sm:max-w-[520px] lg:max-w-none lg:flex lg:gap-6 xl:gap-8">
        {/* Desktop Thumbnails Rail */}
        {images.length > 1 && (
          <div className="hidden lg:flex lg:flex-col lg:gap-4 lg:w-16 xl:w-20">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                onClick={() => handleThumbnailClick(index)}
                className={`relative w-16 h-16 xl:w-20 xl:h-20 rounded-lg xl:rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                  index === activeIndex
                    ? "border-gray-900 ring-2 ring-slate-100 shadow-sm"
                    : "border-slate-200/60 hover:border-slate-300"
                }`}
                aria-label={`View image ${index + 1} of ${images.length}`}
              >
                <Image
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1280px) 80px, 64px"
                  unoptimized={image.startsWith("data:")}
                />
              </button>
            ))}
          </div>
        )}

        {/* Main Image Container */}
        <div className="w-full mx-auto space-y-3 sm:space-y-4">
          {/* Sliding Image Carousel */}
          <div
            className="relative w-full aspect-square sm:aspect-4/5 lg:aspect-4/5 max-w-[520px] mx-auto sm:max-w-none max-h-none sm:max-h-[600px] lg:max-h-[650px] xl:max-h-[700px] rounded-lg overflow-hidden ring-1 ring-black/5 group cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex h-full transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {images.map((image, index) => (
                <div key={index} className="shrink-0 w-full h-full relative">
                  <Image
                    src={image}
                    alt={`${productName} - Image ${index + 1} of ${
                      images.length
                    }`}
                    fill
                    className="object-contain object-[60%_50%] sm:object-center p-0 sm:p-1 md:p-3 lg:p-4"
                    sizes="(min-width: 1024px) 560px, 100vw"
                    priority={index === 0}
                    unoptimized={image.startsWith("data:")}
                  />

                  {/* Zoom on hover effect */}
                  <div className="absolute inset-0 bg-transparent hover:bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.02)_100%)] transition-all duration-300 pointer-events-none opacity-0 hover:opacity-100" />
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-2 sm:left-3 lg:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-white/90 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 lg:opacity-100 transition-opacity duration-200 hover:bg-white shadow-sm"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-gray-700" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 sm:right-3 lg:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-white/90 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 lg:opacity-100 transition-opacity duration-200 hover:bg-white shadow-sm"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-gray-700" />
                </button>
              </>
            )}

            {/* Fullscreen Toggle */}
            <button
              onClick={handleFullscreenToggle}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 lg:top-4 lg:right-4 w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-white/90 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 lg:opacity-100 transition-opacity duration-200 hover:bg-white shadow-sm"
              aria-label="View fullscreen"
            >
              <Expand className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-gray-700" />
            </button>

            {/* Out of Stock Overlay */}
            {(isOutOfStock || isUnavailable) && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                <span className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium text-gray-900 uppercase tracking-wide border border-white/20">
                  {isUnavailable ? "Unavailable" : "Out of Stock"}
                </span>
              </div>
            )}

            {/* Sliding Indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-3 sm:bottom-4 lg:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? "bg-white shadow-lg scale-125"
                        : "bg-white/50 hover:bg-white/70"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Mobile Thumbnails */}
          {images.length > 1 && (
            <div className="mx-auto w-full max-w-[420px] sm:max-w-[520px] lg:hidden flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide px-1 justify-center max-w-full">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  onClick={() => handleThumbnailClick(index)}
                  className={`relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg border-2 overflow-hidden transition-all duration-200 ${
                    index === activeIndex
                      ? "border-gray-900 ring-2 ring-slate-100 shadow-sm scale-105"
                      : "border-slate-200/60 hover:border-slate-300 active:scale-95"
                  }`}
                  aria-label={`View image ${index + 1} of ${images.length}`}
                >
                  <Image
                    src={image}
                    alt={`${productName} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized={image.startsWith("data:")}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="text-center text-sm text-slate-500">
              {activeIndex + 1} of {images.length}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2 sm:p-4"
          onClick={handleFullscreenToggle}
        >
          <div
            className="relative w-full max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-screen"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[activeIndex]}
              alt={`${productName} - Fullscreen view`}
              fill
              className="object-contain"
              sizes="100vw"
              unoptimized={images[activeIndex].startsWith("data:")}
            />

            {/* Close Button */}
            <button
              onClick={handleFullscreenToggle}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Close fullscreen"
            >
              <span className="text-lg sm:text-xl font-light">×</span>
            </button>

            {/* Fullscreen Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </>
            )}

            {/* Fullscreen Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm text-white">
                {activeIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
