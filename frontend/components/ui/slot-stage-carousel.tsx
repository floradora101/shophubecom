"use client";

import { useRef, useCallback, useMemo, useState } from "react";
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

export function SlotStageCarousel<T>({
  items,
  activeIndex,
  onActiveIndexChange,
  isMobile,
  renderCard,
}: SlotStageCarouselProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragPx, setDragPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  // Calculate which items should be visible and their positions with smooth transitions
  const visibleItems = useMemo(() => {
    const total = items.length;
    const maxVisible = isMobile ? 3 : 5; // Show 3 on mobile, 5 on desktop
    const result: Array<{
      item: T;
      index: number;
      style: SlotStyle;
    }> = [];

    const baseOffset = 280 + (isMobile ? 20 : 24); // cardWidth + gap

    // Calculate items around the active index with smooth positioning
    for (
      let i = -Math.floor(maxVisible / 2);
      i <= Math.floor(maxVisible / 2);
      i++
    ) {
      const itemIndex = (activeIndex + i + total) % total;
      const x = i * baseOffset + dragPx;
      const distanceFromCenter = x / baseOffset;

      result.push({
        item: items[itemIndex],
        index: itemIndex,
        style: getSmoothSlotStyle(distanceFromCenter, isMobile),
      });
    }

    return result;
  }, [items, activeIndex, isMobile, dragPx]);

  // Navigation functions
  const goToNext = useCallback(() => {
    if (items.length <= 1) return;
    const nextIndex = (activeIndex + 1) % items.length;
    onActiveIndexChange(nextIndex);
  }, [activeIndex, items.length, onActiveIndexChange]);

  const goToPrev = useCallback(() => {
    if (items.length <= 1) return;
    const prevIndex = (activeIndex - 1 + items.length) % items.length;
    onActiveIndexChange(prevIndex);
  }, [activeIndex, items.length, onActiveIndexChange]);

  const goToIndex = useCallback(
    (index: number) => {
      onActiveIndexChange(index);
    },
    [onActiveIndexChange]
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

  // Pointer drag handlers for smooth circular motion
  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (items.length <= 1) return;
      setIsDragging(true);
      setStartX(event.clientX);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [items.length]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!isDragging) return;

      const dx = event.clientX - startX;
      const baseOffset = 280 + (isMobile ? 20 : 24);
      // Clamp drag to reasonable bounds (e.g., ±2 items)
      const maxDrag = baseOffset * 2;
      setDragPx(Math.max(-maxDrag, Math.min(maxDrag, dx)));
    },
    [isDragging, startX, isMobile]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent) => {
      if (!isDragging) return;

      const baseOffset = 280 + (isMobile ? 20 : 24);
      const shift = Math.round(dragPx / baseOffset);
      if (shift !== 0) {
        const newIndex = (activeIndex - shift + items.length) % items.length;
        onActiveIndexChange(newIndex);
      }

      setIsDragging(false);
      setDragPx(0);
      event.currentTarget.releasePointerCapture(event.pointerId);
    },
    [
      isDragging,
      dragPx,
      activeIndex,
      items.length,
      onActiveIndexChange,
      isMobile,
    ]
  );

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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {visibleItems.map(({ item, index, style }) => (
          <div
            key={index}
            className={`absolute ${
              isDragging ? "" : "transition-all duration-700 ease-out"
            }`}
            style={{
              transform: `translate(${style.x}px, ${style.y}px) scale(${style.scale})`,
              opacity: style.opacity,
              zIndex: style.zIndex,
              transitionTimingFunction: isDragging
                ? "ease-out"
                : "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            {renderCard(item, index, style.x === 0)}
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {items.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full border-2 border-primary-300 bg-white hover:bg-primary-50 hover:border-primary-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full border-2 border-primary-300 bg-white hover:bg-primary-50 hover:border-primary-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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
              className={`transition-all duration-500 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
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
