// Modern Product Details Tabs - 2026 Design Trends
"use client";

import React, { useMemo } from "react";
import { FileText, Star, Settings } from "lucide-react";
import { Tabs, TabItem } from "@/components/ui/tabs";
import type { Product } from "@/features/products/types";
import { mockReviewStats } from "@/lib/mock-data/mock-reviews";
import { useScreenSize } from "./tabs/hooks/useScreenSize";
import { DescriptionTab } from "./tabs/components/DescriptionTab";
import { SpecificationsTab } from "./tabs/components/SpecificationsTab";
import { ReviewsTab } from "./tabs/components/ReviewsTab";

interface ProductDetailsTabsProps {
  product: Product;
}

export function ProductDetailsTabs({ product }: ProductDetailsTabsProps) {
  // Extract screen size detection to custom hook
  const { isMobile, isLarge: isLargeScreen } = useScreenSize();

  const tabs: TabItem[] = useMemo(() => {
    const tabItems: TabItem[] = [];

    // Specifications Tab - Always include but hide on xl+ screens using CSS
    // This prevents hydration mismatch issues
    if (product.specs && product.specs.length > 0) {
      tabItems.push({
        id: "specifications",
        label: isMobile ? "Specs" : "Specifications",
        icon: isMobile ? null : <Settings className="h-4 w-4" />,
        content: <SpecificationsTab product={product} />,
        hiddenOnLarge: true, // Hide on xl+ screens using CSS
      });
    }

    // Description Tab
    if (product.description) {
      tabItems.push({
        id: "description",
        label: isMobile ? "Info" : "Description",
        icon: isMobile ? null : <FileText className="h-4 w-4" />,
        content: <DescriptionTab product={product} />,
      });
    }

    // Reviews Tab
    tabItems.push({
      id: "reviews",
      label: "Reviews",
      icon: isMobile ? null : <Star className="h-4 w-4" />,
      badge: mockReviewStats.totalReviews,
      content: <ReviewsTab product={product} />,
    });

    return tabItems;
  }, [product, isMobile]);

  if (tabs.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Product Details
        </h3>
        <p className="text-muted-foreground">
          No additional details are available for this product.
        </p>
      </div>
    );
  }

  // Determine default tab - prefer description, then reviews, never specs
  const defaultTab = useMemo(() => {
    if (product.description) return "description";
    return "reviews";
  }, [product.description]);

  return (
    <div className="w-full">
      {/* Responsive tab sizing: smaller on mobile, larger on big screens */}
      <Tabs
        tabs={tabs}
        defaultTab={defaultTab}
        variant="pill"
        size={isLargeScreen ? "lg" : isMobile ? "sm" : "md"}
        className="transition-all duration-300"
      />
    </div>
  );
}
