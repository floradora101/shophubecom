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
      <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-12 items-stretch gap-8 lg:gap-12 px-5  lg:px-14 ">
        <div
          data-text
          className={cn(
            "flex flex-col justify-center min-h-0 space-y-5 lg:space-y-7",
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
 * STABLE GRID LAYOUT - CONSISTENT MEDIA ALIGNMENT:
 * - Outer container: Full width and height for stable layout contract
 * - Inner container: CSS Grid with 12-column system for predictable positioning
 * - Layout approach: Grid-based layout (text left, media right) with flexbox centering
 *
 * VISUAL HIERARCHY & IMPACT:
 * - Text: 5/12 width (41.67%) - Optimal reading width without wasting space
 * - Media: 7/12 width (58.33%) - Dominant visual presence with consistent alignment
 * - Grid positioning: Creates stable visual anchor and clear content separation
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
 * - User experience: Consistent media alignment prevents layout shift
 *
 * Content clamp utilities for consistent text handling
 */
export const contentClamp = {
  headline: "line-clamp-3 lg:line-clamp-2",
  description: "line-clamp-2",
  bullet: "line-clamp-1",
  cta: "truncate",
} as const;
