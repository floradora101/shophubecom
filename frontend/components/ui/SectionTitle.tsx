/**
 * Reusable Section Title Component with Optional Left Icon Decorations
 *
 * A flexible title component that can be used across the app with customizable text and styling.
 * Supports optional heart decoration on the left side and can be configured for different sections.
 *
 * @example
 * // Default "You May Also Like" with left heart
 * <SectionTitle />
 *
 * @example
 * // Custom title without heart
 * <SectionTitle
 *   badgeText="Featured Products"
 *   title="Trending Now"
 *   subtitle="Check out what's popular"
 *   showHearts={false}
 * />
 *
 * @example
 * // Custom styling
 * <SectionTitle
 *   title="Special Offers"
 *   titleClassName="text-red-600"
 *   badgeClassName="bg-red-50 border-red-200"
 * />
 */
"use client";

import React from "react";
import { Heart, LucideIcon } from "lucide-react";

interface SectionTitleProps {
  // Main badge text (what appears in the rounded badge)
  badgeText?: string;
  // Main title text
  title?: string;
  // Subtitle/description text
  subtitle?: string;
  // Whether to show heart decorations (default for backward compatibility)
  showHearts?: boolean;
  // Custom icon component (takes precedence over hearts)
  icon?: LucideIcon;
  // Custom className for the container
  className?: string;
  // Custom className for the badge
  badgeClassName?: string;
  // Custom className for the title
  titleClassName?: string;
  // Custom className for the subtitle
  subtitleClassName?: string;
}

export function SectionTitle({
  badgeText = "You May Also Like",
  title = "Discover More",
  subtitle = "Curated recommendations based on your interests",
  showHearts = true,
  icon,
  className = "",
  badgeClassName = "",
  titleClassName = "",
  subtitleClassName = "",
}: SectionTitleProps) {
  return (
    <div className={`text-center space-y-4 ${className}`}>
      {/* Badge with optional hearts */}
      <div
        className={`inline-flex items-center gap-3 px-6 py-3 bg-linear-to-r from-primary-50 to-primary-100/50 rounded-full border border-primary-200/50 ${badgeClassName}`}
      >
        {/* Left Icon - conditionally rendered */}
        {(icon || showHearts) && (
          <div className="relative mr-2">
            {icon ? (
              React.createElement(icon, {
                className:
                  "w-4 h-4 text-primary-500 fill-primary-500 animate-pulse",
              })
            ) : (
              <Heart className="w-4 h-4 text-primary-500 fill-primary-500 animate-pulse" />
            )}
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary-400 rounded-full animate-ping opacity-75" />
          </div>
        )}

        {/* Badge Text */}
        <span className="text-sm font-medium text-primary-700 uppercase tracking-wide">
          {badgeText}
        </span>
      </div>

      {/* Main Title */}
      <h2
        className={`text-2xl md:text-3xl font-bold text-slate-900 ${titleClassName}`}
      >
        {title}
      </h2>

      {/* Subtitle */}
      <p
        className={`text-slate-600 max-w-none mx-auto whitespace-normal break-word lg:max-w-md ${subtitleClassName}`}
      >
        {subtitle}
      </p>
    </div>
  );
}

// Backward compatibility alias - keeps existing code working
export const YouMayAlsoLikeTitle = SectionTitle;

/*
Usage Examples:

// 1. Default "You May Also Like" with left heart (backward compatible)
<YouMayAlsoLikeTitle />

// 2. Custom section title without heart
<SectionTitle
  badgeText="Featured Products"
  title="Trending Now"
  subtitle="Check out what's popular this week"
  showHearts={false}
/>

// 3. Custom section title with star icon
<SectionTitle
  badgeText="Refine Your Search"
  title=""
  subtitle="Find exactly what you're looking for"
  icon={Star}
  showHearts={false}
  className="text-left"
  badgeClassName="justify-start"
/>

// 4. Special offers with custom styling
<SectionTitle
  badgeText="SPECIAL OFFERS"
  title="Limited Time Deals"
  subtitle="Don't miss out on these amazing discounts"
  showHearts={false}
  titleClassName="text-red-600"
  badgeClassName="bg-red-50 border-red-200"
/>

// 5. Product recommendations with left heart
<SectionTitle
  badgeText="Recommended for You"
  title="Personal Picks"
  subtitle="Based on your browsing history"
  showHearts={true}
/>

// 6. Simple title without badge
<SectionTitle
  badgeText=""
  title="Our Collection"
  subtitle="Explore our curated selection"
  showHearts={false}
/>
*/
