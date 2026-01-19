"use client";

import { cn } from "@/lib/utils/cn";
import { useEffect, useState } from "react";

interface SlideCounterProps {
  /** Current slide index (0-based) */
  currentIndex: number;
  /** Total number of slides */
  totalSlides: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the counter (hide if only 1 slide) */
  show?: boolean;
}

export function SlideCounter({
  currentIndex,
  totalSlides,
  className,
  show = true,
}: SlideCounterProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [prevIndex, setPrevIndex] = useState(currentIndex);

  // Fade in animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Track slide changes for animation
  useEffect(() => {
    if (prevIndex !== currentIndex) {
      setPrevIndex(currentIndex);
    }
  }, [currentIndex, prevIndex]);

  // Don't show if only one slide or explicitly hidden
  if (!show || totalSlides <= 1) return null;

  const currentSlide = currentIndex + 1;
  const formattedCurrent = currentSlide;
  const formattedTotal = totalSlides;
  const progress = ((currentIndex + 1) / totalSlides) * 100;

  return (
    <div
      className={cn(
        "relative z-30",
        "transition-opacity duration-500 ease-out",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
      aria-label={`Slide ${currentSlide} of ${totalSlides}`}
    >
      {/* Smaller, brand-consistent container - using primary color gradient from app theme */}
      <div
        className={cn(
          "relative overflow-hidden",
          "px-2 py-0.5 sm:px-2.5 sm:py-1",
          "rounded-lg",
          "bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700",
          "text-white shadow-lg",
          "border border-white/20",
          "backdrop-blur-sm"
        )}
      >
        {/* Content container */}
        <div className="relative flex items-center gap-1.5">
          {/* Current slide number */}
          <span
            key={currentIndex}
            className={cn(
              "font-mono text-[10px] sm:text-[11px] font-bold",
              "text-white",
              "tracking-tight",
              "inline-block"
            )}
            aria-hidden="true"
          >
            {formattedCurrent}
          </span>

          {/* Divider */}
          <span
            className={cn(
              "text-white/60",
              "text-[9px] sm:text-[10px]",
              "font-light",
              "select-none"
            )}
            aria-hidden="true"
          >
            /
          </span>

          {/* Total slides */}
          <span
            className={cn(
              "font-mono text-[10px] sm:text-[11px] font-medium",
              "text-white/85",
              "tracking-tight"
            )}
            aria-hidden="true"
          >
            {formattedTotal}
          </span>
        </div>
      </div>
    </div>
  );
}

SlideCounter.displayName = "SlideCounter";
