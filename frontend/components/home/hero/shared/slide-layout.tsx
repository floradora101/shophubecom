import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface SlideLayoutProps {
  textContent: ReactNode;
  mediaContent: ReactNode;
  className?: string;
  mediaFirst?: boolean;
}

export function SlideLayout({
  textContent,
  mediaContent,
  className,
  mediaFirst = false,
}: SlideLayoutProps) {
  return (
    <div className={cn("w-full h-full", className)}>
      <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-12 items-stretch gap-8 lg:gap-12 px-5 lg:px-14">
        <div
          data-text
          className={cn(
            "grid grid-rows-[auto_auto_auto_1fr_auto_auto] gap-3 lg:gap-3 min-h-0",
            mediaFirst ? "lg:order-2" : "lg:order-1",
            "lg:col-span-5"
          )}
        >
          {textContent}
        </div>

        <div
          data-media
          className={cn(
            "flex min-h-0 h-full justify-center lg:justify-end items-start lg:items-stretch",
            mediaFirst ? "lg:order-1" : "lg:order-2",
            "lg:col-span-7"
          )}
        >
          <div className="w-full max-w-[620px] lg:h-[calc(var(--hero-h)-var(--hero-pad))] min-h-0">
            {mediaContent}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Production-Grade Layout Design Decisions:
 *
 * FIXED GRID SLOTS - PIXEL-PERFECT CONTENT POSITIONING:
 * - Outer container: Full width and height for stable layout contract
 * - Inner container: CSS Grid with 12-column system for predictable positioning
 * - Text container: CSS Grid with 6 fixed rows for absolute content positioning:
 *   Row 1: Badge (auto height)
 *   Row 2: Headline (auto height)
 *   Row 3: Description (auto height)
 *   Row 4: Flexible middle space (1fr)
 *   Row 5: CTAs (auto height)
 *   Row 6: Trust elements (auto height)
 * - Layout approach: Grid-based layout (text left, media right) with fixed slot positioning
 *
 * VISUAL HIERARCHY & IMPACT:
 * - Text: 5/12 width (41.67%) - Optimal reading width without wasting space
 * - Media: 7/12 width (58.33%) - Dominant visual presence with consistent alignment
 * - Grid positioning: Creates stable visual anchor and clear content separation
 * - Fixed slots: Ensures pixel-perfect positioning across all slide types
 * - Space efficiency: Grid constraints ensure consistent media sizing across slides
 *
 * RESPONSIVE DESIGN EXCELLENCE:
 * - Mobile: Full-width stacked (text first, media below)
 * - Desktop: Text left (grid column 1-5), Media right (grid column 6-12)
 * - Container scaling: Inherits from parent container for consistent behavior
 * - Breakpoint optimization: Smooth transitions between layout modes
 *
 * ACCESSIBILITY & UX:
 * - Semantic HTML: Text and media in normal document flow
 * - Visual hierarchy: Clear separation between text and media content
 * - Performance: CSS Grid for efficient layout calculations
 * - Space utilization: Maximum content area with predictable positioning
 * - User experience: Fixed slot positioning prevents layout shift and ensures consistency
 *
 * Content clamp utilities for consistent text handling
 */
export const contentClamp = {
  headline: "line-clamp-3 lg:line-clamp-2",
  description: "line-clamp-2",
  bullet: "line-clamp-1",
  cta: "truncate",
} as const;
