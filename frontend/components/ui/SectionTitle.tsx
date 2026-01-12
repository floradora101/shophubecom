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

import React from "react";
import { Zap, LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  showHearts = false,
  icon,
  className = "",
  badgeClassName = "",
  titleClassName = "",
  subtitleClassName = "",
}: SectionTitleProps) {
  return (
    <div className={`text-center space-y-4 ${className}`}>
      {/* Badge with optional hearts */}
      <Badge
        variant="primary"
        size="default"
        className={`mb-4 ${badgeClassName}`}
      >
        {/* Left Icon - conditionally rendered */}
        {(icon || showHearts) && (
          <div className="relative">
            {icon ? (
              React.createElement(icon, {
                className: "w-3.5 h-3.5",
              })
            ) : (
              <Zap className="w-3.5 h-3.5 fill-current" />
            )}
          </div>
        )}

        {badgeText}
      </Badge>

      {/* Main Title */}
      <h2
        className={`text-2xl md:text-3xl font-bold text-gray-900 ${titleClassName}`}
      >
        {title}
      </h2>

      {/* Subtitle */}
      <p
        className={`text-slate-600 max-w-none mx-auto whitespace-normal break-words lg:max-w-md ${subtitleClassName}`}
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
