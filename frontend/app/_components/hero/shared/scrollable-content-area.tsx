"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface ScrollableContentAreaProps {
  children: ReactNode;
  className?: string;
  enableTouchScroll?: boolean;
}

/**
 * ScrollableContentArea - Plain wrapper for content areas
 *
 * Now serves as a simple wrapper without scroll behavior.
 * Scroll behavior is handled at the SlideLayout level.
 */
export function ScrollableContentArea({
  children,
  className,
}: ScrollableContentAreaProps) {
  return <div className={cn("relative w-full", className)}>{children}</div>;
}

/**
 * Usage in hero slides:
 *
 * Wrap content that might overflow in ScrollableContentArea:
 *
 * <ScrollableContentArea>
 *   <div>Content that might be taller than container</div>
 * </ScrollableContentArea>
 *
 * The component will:
 * - Always enable scrolling on touch devices for consistent UX
 * - Hide visual scrollbars while maintaining scroll functionality
 * - Provide smooth momentum scrolling
 */
