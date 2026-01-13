"use client";

import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { NavigationButton } from "./navigation-button";
import { DotIndicator } from "./dot-indicator";

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

const CARD_WIDTH = 280;

// Get smooth slot styles based on distance from center
function getSmoothSlotStyle(
  distanceFromCenter: number,
  isMobile: boolean
): SlotStyle {
  const gap = isMobile ? 20 : 24;
  const maxVisibleDistance = isMobile ? 1 : 2;

  // Clamp distance to visible range
  const clampedDistance = Math.max(
    -maxVisibleDistance,
    Math.min(maxVisibleDistance, distanceFromCenter)
  );

  // Calculate position
  const baseOffset = CARD_WIDTH + gap;
  const x = clampedDistance * baseOffset;

  // Smooth scale curve: center = 1.08, edges = 0.7-0.85
  const scaleRange = isMobile ? 0.23 : 0.38;
  const scale =
    1.08 - (Math.abs(clampedDistance) / maxVisibleDistance) * scaleRange;

  // Smooth opacity curve: center = 1.0, edges = 0.4-0.6
  const opacityRange = isMobile ? 0.4 : 0.6;
  const opacity =
    1.0 - (Math.abs(clampedDistance) / maxVisibleDistance) * opacityRange;

  // Z-index based on proximity to center
  const zIndex = Math.max(1, 5 - Math.abs(clampedDistance));

  return { x, y: 0, scale, opacity, zIndex };
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

export function SlotStageCarousel<T>({
  items,
  activeIndex,
  onActiveIndexChange,
  isMobile,
  renderCard,
}: SlotStageCarouselProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs to prevent double moves in the same tick (snap + click, etc.)
  const transitioningRef = useRef(false);
  const transitionTimerRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);

  // Drag state (smooth follow + snap)
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0); // px
  const [dragStartX, setDragStartX] = useState<number | null>(null);

  const total = items.length;

  const visibleRange = useMemo(
    () => getVisibleRange(total, isMobile),
    [total, isMobile]
  );

  // Transition lock helper (prevents double navigation)
  const startTransitionLock = useCallback((ms: number) => {
    transitioningRef.current = true;

    if (transitionTimerRef.current)
      window.clearTimeout(transitionTimerRef.current);

    transitionTimerRef.current = window.setTimeout(() => {
      transitioningRef.current = false;
    }, ms);
  }, []);

  // Must be >= transitionDuration (700ms)
  const LOCK_MS = 750;

  const goToNext = useCallback(() => {
    if (total <= 1 || transitioningRef.current) return;
    startTransitionLock(LOCK_MS);
    onActiveIndexChange((activeIndex + 1) % total);
  }, [activeIndex, total, onActiveIndexChange, startTransitionLock]);

  const goToPrev = useCallback(() => {
    if (total <= 1 || transitioningRef.current) return;
    startTransitionLock(LOCK_MS);
    onActiveIndexChange((activeIndex - 1 + total) % total);
  }, [activeIndex, total, onActiveIndexChange, startTransitionLock]);

  // Keyboard nav
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goToNext();
    }
  };

  // Compute visible items around active index (stable keys).
  const visibleItems = useMemo(() => {
    if (total === 0) return [];

    const result: Array<{
      item: T;
      index: number; // itemIndex
      distanceFromCenter: number;
      style: SlotStyle;
    }> = [];

    const effectiveDragOffset = isDragging ? dragOffset : 0;

    for (let i = -visibleRange; i <= visibleRange; i++) {
      const itemIndex = (activeIndex + i + total) % total;
      const distanceFromCenter = i + effectiveDragOffset / CARD_WIDTH;

      result.push({
        item: items[itemIndex],
        index: itemIndex,
        distanceFromCenter,
        style: getSmoothSlotStyle(distanceFromCenter, isMobile),
      });
    }

    return result;
  }, [
    items,
    total,
    activeIndex,
    visibleRange,
    isMobile,
    dragOffset,
    isDragging,
  ]);

  // Drag handlers: smooth follow + snap on release
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (transitioningRef.current || total <= 1) return;

      setIsDragging(true);
      setDragStartX(event.clientX);
      setDragOffset(0);

      suppressClickRef.current = false;
    },
    [total]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging || dragStartX === null) return;
      setDragOffset(event.clientX - dragStartX);
    },
    [isDragging, dragStartX]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;

    const offset = dragOffset;
    const snapThreshold = 90; // px to snap
    const dragClickThreshold = 6; // px to suppress click

    suppressClickRef.current = Math.abs(offset) > dragClickThreshold;

    setIsDragging(false);
    setDragStartX(null);
    setDragOffset(0);

    if (Math.abs(offset) < snapThreshold) {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
      return;
    }

    if (offset > 0) goToPrev();
    else goToNext();

    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  }, [isDragging, dragOffset, goToPrev, goToNext]);

  useEffect(() => {
    if (!isDragging) return;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current)
        window.clearTimeout(transitionTimerRef.current);
    };
  }, []);

  if (total === 0) return null;

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
        onClickCapture={(e) => {
          if (suppressClickRef.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {visibleItems.map(({ item, index, distanceFromCenter, style }) => (
          <div
            key={`item-${index}`}
            className="absolute will-change-transform"
            style={{
              transform: `translate3d(${style.x}px, ${style.y}px, 0) scale(${style.scale})`,
              opacity: style.opacity,
              zIndex: style.zIndex,

              transitionProperty: isDragging ? "none" : "transform, opacity",
              transitionDuration: isDragging ? "0ms" : "700ms",
              transitionTimingFunction: isDragging
                ? "linear"
                : "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            {renderCard(item, index, Math.abs(distanceFromCenter) < 0.5)}
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {total > 1 && (
        <>
          <NavigationButton
            variant="primary"
            direction="left"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-red-600 text-white border-red-500 hover:bg-red-700 shadow-xl"
          />

          <NavigationButton
            variant="primary"
            direction="right"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-red-600 text-white border-red-500 hover:bg-red-700 shadow-xl"
          />
        </>
      )}

      {/* Dots Indicator */}
      {total > 1 && (
        <DotIndicator
          count={total}
          activeIndex={activeIndex}
          onSelect={onActiveIndexChange}
          shape="circle"
          size="md"
          className="mt-8"
        />
      )}
    </div>
  );
}
