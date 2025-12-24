"use client";

import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface SlotStageCarouselProps<T> {
  items: T[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  isMobile: boolean;
  renderCard: (item: T, index: number, isCenter: boolean) => ReactNode;
}

interface SlotStyle {
  x: number; // translateX in pixels
  y: number; // translateY in pixels
  scale: number;
  opacity: number;
  zIndex: number;
}

// Get smooth slot styles based on distance from center
function getSmoothSlotStyle(
  distanceFromCenter: number,
  isMobile: boolean
): SlotStyle {
  const cardWidth = 280;
  const gap = isMobile ? 20 : 24;
  const maxVisibleDistance = isMobile ? 1 : 2;

  // Clamp distance to visible range
  const clampedDistance = Math.max(
    -maxVisibleDistance,
    Math.min(maxVisibleDistance, distanceFromCenter)
  );

  // Calculate position with smooth interpolation
  const baseOffset = cardWidth + gap;
  const x = clampedDistance * baseOffset;

  // Smooth scale curve: center = 1.08, edges = 0.7-0.85
  const scaleRange = isMobile ? 0.23 : 0.38; // 1.08 - 0.85 = 0.23, 1.08 - 0.7 = 0.38
  const scale =
    1.08 - (Math.abs(clampedDistance) / maxVisibleDistance) * scaleRange;

  // Smooth opacity curve: center = 1.0, edges = 0.4-0.6
  const opacityRange = isMobile ? 0.4 : 0.6; // 1.0 - 0.6 = 0.4, 1.0 - 0.4 = 0.6
  const opacity =
    1.0 - (Math.abs(clampedDistance) / maxVisibleDistance) * opacityRange;

  // Z-index based on proximity to center
  const zIndex = Math.max(1, 5 - Math.abs(clampedDistance));

  return {
    x,
    y: 0,
    scale,
    opacity,
    zIndex,
  };
}

// Get visible range based on total items and mobile/desktop
function getVisibleRange(total: number, isMobile: boolean): number {
  if (isMobile) {
    // Mobile: show up to 3 slots if total>=3, else 1
    return total >= 3 ? 1 : 0;
  } else {
    // Desktop: show up to 5 slots if total>=5, else 3 slots if total>=3, else 1
    if (total >= 5) return 2;
    if (total >= 3) return 1;
    return 0;
  }
}

// Map delta to slot position
function getPositionFromDelta(
  delta: number,
  visibleRange: number,
  isMobile: boolean
): "left2" | "left1" | "center" | "right1" | "right2" | null {
  if (delta === 0) return "center";

  if (isMobile) {
    // Mobile: only left1, center, right1
    if (delta === -1) return "left1";
    if (delta === 1) return "right1";
    return null;
  } else {
    // Desktop: left2, left1, center, right1, right2
    if (delta === -2) return "left2";
    if (delta === -1) return "left1";
    if (delta === 1) return "right1";
    if (delta === 2) return "right2";
    return null;
  }
}

export function SlotStageCarousel<T>({
  items,
  activeIndex,
  onActiveIndexChange,
  isMobile,
  renderCard,
}: SlotStageCarouselProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate which items should be visible and their positions with smooth transitions
  const visibleItems = useMemo(() => {
    const total = items.length;
    const maxVisible = isMobile ? 3 : 5; // Show 3 on mobile, 5 on desktop
    const result: Array<{
      item: T;
      index: number;
      distanceFromCenter: number;
      style: SlotStyle;
    }> = [];

    // Calculate items around the active index with smooth positioning
    for (
      let i = -Math.floor(maxVisible / 2);
      i <= Math.floor(maxVisible / 2);
      i++
    ) {
      const itemIndex = (activeIndex + i + total) % total;
      const distanceFromCenter = i + dragOffset / 280; // Add drag offset for smooth dragging

      // Only show items within reasonable distance
      if (Math.abs(distanceFromCenter) <= (isMobile ? 1.5 : 2.5)) {
        result.push({
          item: items[itemIndex],
          index: itemIndex,
          distanceFromCenter,
          style: getSmoothSlotStyle(distanceFromCenter, isMobile),
        });
      }
    }

    return result;
  }, [items, activeIndex, isMobile, dragOffset]);

  // Smooth navigation with transition states
  const goToNext = useCallback(() => {
    if (items.length <= 1 || isTransitioning) return;
    setIsTransitioning(true);
    const nextIndex = (activeIndex + 1) % items.length;
    onActiveIndexChange(nextIndex);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [activeIndex, items.length, onActiveIndexChange, isTransitioning]);

  const goToPrev = useCallback(() => {
    if (items.length <= 1 || isTransitioning) return;
    setIsTransitioning(true);
    const prevIndex = (activeIndex - 1 + items.length) % items.length;
    onActiveIndexChange(prevIndex);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [activeIndex, items.length, onActiveIndexChange, isTransitioning]);

  const goToIndex = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      onActiveIndexChange(index);
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [onActiveIndexChange, isTransitioning]
  );

  // Smooth circular navigation
  const goToOffset = useCallback(
    (offset: number) => {
      if (items.length <= 1 || isTransitioning) return;
      setIsTransitioning(true);
      const newIndex = (activeIndex + offset + items.length) % items.length;
      onActiveIndexChange(newIndex);
      setTimeout(() => setIsTransitioning(false), 600);
    },
    [activeIndex, items.length, onActiveIndexChange, isTransitioning]
  );

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goToNext();
    }
  };

  // Mouse drag handlers for smooth circular motion
  const [dragStart, setDragStart] = useState<{
    x: number;
    index: number;
  } | null>(null);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (isTransitioning) return;
      setIsDragging(true);
      setDragStart({ x: event.clientX, index: activeIndex });
    },
    [isTransitioning, activeIndex]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      if (!isDragging || !dragStart) return;

      const deltaX = event.clientX - dragStart.x;
      const sensitivity = 200; // pixels per item
      const offset = Math.round(deltaX / sensitivity);

      if (offset !== 0) {
        const newIndex =
          (dragStart.index - offset + items.length) % items.length;
        if (newIndex !== activeIndex) {
          onActiveIndexChange(newIndex);
        }
      }
    },
    [isDragging, dragStart, activeIndex, items.length, onActiveIndexChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  // Add global mouse up listener
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (event: MouseEvent) => {
        handleMouseMove(event);
      };

      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mousemove", handleGlobalMouseMove);
      return () => {
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("mousemove", handleGlobalMouseMove);
      };
    }
  }, [isDragging, handleMouseUp, handleMouseMove]);

  if (items.length === 0) return null;

  return (
    <div className="relative w-full">
      {/* Carousel Container */}
      <div
        ref={containerRef}
        className={`relative flex items-center justify-center min-h-[500px] overflow-hidden ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ perspective: "1200px" }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
      >
        {visibleItems.map(({ item, index, distanceFromCenter, style }) => (
          <div
            key={`item-${index}-${Math.round(distanceFromCenter * 100)}`}
            className="absolute transition-all duration-700 ease-out"
            style={{
              transform: `translate(${style.x}px, ${style.y}px) scale(${style.scale})`,
              opacity: style.opacity,
              zIndex: style.zIndex,
              transitionTimingFunction: isDragging
                ? "ease-out"
                : "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            {renderCard(item, index, Math.abs(distanceFromCenter) < 0.5)}
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {items.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            disabled={isTransitioning}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full border-2 border-primary-300 bg-white hover:bg-primary-50 hover:border-primary-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous item"
          >
            <svg
              className="w-5 h-5 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={goToNext}
            disabled={isTransitioning}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full border-2 border-primary-300 bg-white hover:bg-primary-50 hover:border-primary-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next item"
          >
            <svg
              className="w-5 h-5 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {items.length > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              disabled={isTransitioning}
              className={`transition-all duration-500 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed ${
                index === activeIndex
                  ? "w-3 h-3 bg-primary-600 shadow-lg"
                  : "w-2.5 h-2.5 bg-primary-200 hover:bg-primary-400 hover:scale-110"
              }`}
              aria-label={`Go to item ${index + 1} of ${items.length}`}
              aria-current={index === activeIndex ? "true" : "false"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
