// Modern Product Details Tabs - 2026 Design Trends
"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  FileText,
  Star,
  CheckCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Settings,
  Monitor,
  Cpu,
  Database,
  Battery,
  Weight,
  Maximize2,
  Zap,
  Package,
  PenTool,
} from "lucide-react";
import { Tabs, TabItem } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/features/products/types";
import {
  mockReviews,
  mockReviewStats,
  type Review,
  type ReviewStats,
} from "@/lib/mock-data/mock-reviews";
import { cn } from "@/lib/utils/cn";
import { logger } from "@/lib/logger";
import { WriteReviewModal } from "./WriteReviewModal";

// Helper to get icon for spec label
function getSpecIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("screen") || l.includes("display"))
    return <Monitor className="h-4 w-4" />;
  if (l.includes("processor") || l.includes("cpu") || l.includes("chip"))
    return <Cpu className="h-4 w-4" />;
  if (l.includes("storage") || l.includes("ssd") || l.includes("memory"))
    return <Database className="h-4 w-4" />;
  if (l.includes("battery") || l.includes("power"))
    return <Battery className="h-4 w-4" />;
  if (l.includes("weight") || l.includes("mass"))
    return <Weight className="h-4 w-4" />;
  if (l.includes("dimension") || l.includes("size") || l.includes("width"))
    return <Maximize2 className="h-4 w-4" />;
  if (l.includes("performance") || l.includes("speed"))
    return <Zap className="h-4 w-4" />;
  return <Package className="h-4 w-4" />;
}

interface ProductDetailsTabsProps {
  product: Product;
}

// Individual Review Card Component
function ReviewCard({ review }: { review: Review }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const shouldTruncate = review.content.length > 200;
  const displayContent =
    isExpanded || !shouldTruncate
      ? review.content
      : review.content.substring(0, 200) + "...";

  return (
    <div className="py-5 sm:py-8 first:pt-0 border-b border-border/40 last:border-0 transition-all duration-300">
      <div className="space-y-4 sm:space-y-5">
        {/* Header with user info and rating */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Avatar className="h-9 w-9 sm:h-11 sm:w-11 ring-offset-2 ring-1 ring-border/50 shrink-0">
              <AvatarImage src={review.userAvatar} alt={review.userName} />
              <AvatarFallback className="bg-surface-muted text-muted-fg font-bold text-xs sm:text-base">
                {review.userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-bold text-fg tracking-tight text-sm sm:text-base">
                  {review.userName}
                </span>
                {review.verified && (
                  <Badge variant="success" className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0 font-bold">
                    <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1">
                <StarRating
                  rating={review.rating}
                  size="xs"
                  showCount={false}
                />
                <span className="text-[9px] sm:text-[10px] font-bold text-muted-fg flex items-center gap-1 uppercase tracking-widest opacity-60">
                  <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  {formatDate(review.date)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Review title and content */}
        <div className="space-y-2 sm:space-y-3">
          <h4 className="font-display font-bold text-fg text-base sm:text-lg tracking-tight leading-snug">
            {review.title}
          </h4>
          <p className="text-muted-fg leading-relaxed text-xs sm:text-base font-medium max-w-3xl">
            {displayContent}
          </p>

          {shouldTruncate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-auto p-0 text-primary-600 hover:text-primary-600/80 hover:bg-transparent font-bold text-xs uppercase tracking-widest"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Read more
                </>
              )}
            </Button>
          )}

          {/* Product variant info */}
          {review.productVariant && (
            <div className="text-[10px] font-bold text-muted-fg bg-surface-muted px-2.5 py-1 rounded-md border border-border/40 inline-block uppercase tracking-widest">
              <span className="opacity-50">Purchased:</span>{" "}
              {review.productVariant}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Reviews Summary Component
function ReviewsSummary({ stats }: { stats: ReviewStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 mb-10 sm:mb-16 items-center bg-surface-muted/30 rounded-2xl p-6 sm:p-0 sm:bg-transparent">
      {/* Overall Rating Section */}
      <div className="flex flex-col items-center justify-center py-4 sm:py-10">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="relative inline-block">
            <div className="text-5xl sm:text-7xl font-display font-black text-fg tracking-tighter">
              {stats.averageRating}
            </div>
            <div className="absolute -top-1 -right-3 sm:-right-4 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary-500 animate-pulse" />
          </div>
          <StarRating
            rating={stats.averageRating}
            size="md"
            showCount={false}
          />
          <div className="space-y-1 sm:space-y-2">
            <div className="text-[10px] sm:text-xs font-black text-fg uppercase tracking-[0.2em]">
              Based on {stats.totalReviews} reviews
            </div>
            <div className="text-[9px] sm:text-[10px] font-bold text-muted-fg uppercase tracking-[0.2em] opacity-60">
              {stats.verifiedReviews} verified purchases
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-3 sm:space-y-5 flex flex-col justify-center">
        <h4 className="text-[10px] sm:text-xs font-black text-fg uppercase tracking-[0.2em] mb-2 sm:mb-4 text-center md:text-left opacity-80">
          Rating Breakdown
        </h4>
        <div className="space-y-3 sm:space-y-4">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count =
              stats.ratingDistribution[
                rating as keyof typeof stats.ratingDistribution
              ];
            const percentage = (count / stats.totalReviews) * 100;
            return (
              <div key={rating} className="flex items-center gap-3 sm:gap-4 group">
                <div className="flex items-center gap-1 min-w-[45px] sm:min-w-[55px]">
                  <span className="text-[10px] sm:text-xs font-bold">{rating}</span>
                  <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-primary-500 text-primary-500 transition-transform group-hover:scale-125" />
                </div>
                <div className="flex-1 h-1 sm:h-1.5 bg-surface-muted sm:bg-border/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-1000"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-muted-fg min-w-[30px] sm:min-w-[35px] text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Reviews Tab Content
function ReviewsTab({ product }: { product: Product }) {
  const { reviews, stats } = useMemo(
    () => ({
      reviews: mockReviews,
      stats: mockReviewStats,
    }),
    []
  );

  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "highest" | "lowest"
  >("newest");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showWriteReviewModal, setShowWriteReviewModal] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };

    if (isSortOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSortOpen]);

  const sortedReviews = useMemo(() => {
    const sorted = [...reviews];
    switch (sortBy) {
      case "newest":
        return sorted.sort((a, b) => b.date.getTime() - a.date.getTime());
      case "oldest":
        return sorted.sort((a, b) => a.date.getTime() - b.date.getTime());
      case "highest":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "lowest":
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  }, [reviews, sortBy]);

  const displayedReviews = showAllReviews
    ? sortedReviews
    : sortedReviews.slice(0, 3);

  const handleReviewSubmit = async (reviewData: {
    rating: number;
    content: string;
    userName: string;
    userEmail: string;
  }) => {
    // In a real app, this would submit to an API
    logger.debug("Submitting review:", reviewData);

    // For demo purposes, we'll just show an alert
    alert(
      "Thank you for your review! In a real application, this would be saved to the database."
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Reviews Summary */}
        <ReviewsSummary stats={stats} />

        {/* Reviews Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base sm:text-lg font-display font-bold text-foreground">
            Customer Reviews ({stats.totalReviews})
          </h3>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={() => setShowWriteReviewModal(true)}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none h-8 sm:h-9 text-[11px] sm:text-xs"
            >
              <PenTool className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Write Review
            </Button>

            {/* Sort Dropdown - Consistent with products page */}
            <div className="relative flex-1 sm:flex-none" ref={sortRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="w-full sm:w-auto gap-1.5 sm:gap-2 h-8 sm:h-9 text-[11px] sm:text-xs"
                aria-expanded={isSortOpen}
                aria-haspopup="true"
              >
                <span className="truncate">
                  {sortBy === "newest" && "Newest"}
                  {sortBy === "oldest" && "Oldest"}
                  {sortBy === "highest" && "Highest"}
                  {sortBy === "lowest" && "Lowest"}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform shrink-0",
                    isSortOpen && "rotate-180 text-primary-600"
                  )}
                />
              </Button>

              {isSortOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 border border-border rounded-lg shadow-lg z-50">
                  {[
                    { value: "newest", label: "Newest First" },
                    { value: "oldest", label: "Oldest First" },
                    { value: "highest", label: "Highest Rated" },
                    { value: "lowest", label: "Lowest Rated" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value as typeof sortBy);
                        setIsSortOpen(false);
                      }}
                      className={cn(
                        "block w-full text-left px-3 py-2 text-sm transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                        sortBy === option.value
                          ? "bg-primary-50 text-primary-600"
                          : "hover:bg-surface-muted"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {displayedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Show More/Less Button */}
        {reviews.length > 3 && (
          <div className="text-center pt-2 sm:pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="w-full sm:w-auto px-6 h-10 sm:h-11 text-xs sm:text-sm font-bold uppercase tracking-widest"
            >
              {showAllReviews
                ? "Show Less"
                : `Show All ${reviews.length} Reviews`}
            </Button>
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={showWriteReviewModal}
        onClose={() => setShowWriteReviewModal(false)}
        product={product}
        onSubmit={handleReviewSubmit}
      />
    </>
  );
}

// Specifications Tab Content
function SpecificationsTab({ product }: { product: Product }) {
  if (!product.specs || product.specs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center mx-auto mb-6">
          <Settings className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <h3 className="text-xl font-display font-bold text-foreground mb-2">
          No Specifications Available
        </h3>
        <p className="text-muted-foreground max-w-xs mx-auto text-sm">
          Technical specifications for this product are not currently available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-12">
        {product.specs.map((spec, index) => (
          <div
            key={index}
            className="flex items-start gap-4 transition-all duration-300 group"
          >
            <div className="w-10 h-10 rounded-lg bg-surface-muted flex items-center justify-center text-muted-fg shrink-0 group-hover:bg-primary-500/10 group-hover:text-primary-600 transition-colors duration-300">
              {getSpecIcon(spec.label)}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-[10px] font-black text-muted-fg uppercase tracking-[0.2em] mb-1.5 opacity-50">
                {spec.label}
              </p>
              <p className="text-sm sm:text-base font-bold text-fg truncate">
                {spec.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Description Tab Content
function DescriptionTab({ product }: { product: Product }) {
  const description = product.description;

  if (!description) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-fg mx-auto mb-4" />
        <h3 className="text-lg font-medium text-fg mb-2">
          No Description Available
        </h3>
        <p className="text-muted-fg">
          A description for this product is not currently available.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="space-y-10">
        <div className="flex items-center gap-4 mb-2">
          <h4 className="text-xl sm:text-2xl font-display font-bold text-fg tracking-tight">
            Design & Features
          </h4>
        </div>

        <div className="prose prose-slate prose-sm md:prose-base max-w-none">
          <p className="text-muted-fg leading-relaxed whitespace-pre-line text-sm sm:text-base">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-4 pt-10 border-t border-border/40">
          <div className="flex items-center gap-2 text-[11px] font-bold text-muted-fg uppercase tracking-widest">
            <CheckCircle className="h-3.5 w-3.5 text-muted-fg opacity-60" />
            <span>Premium Quality</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-muted-fg uppercase tracking-widest">
            <CheckCircle className="h-3.5 w-3.5 text-muted-fg opacity-60" />
            <span>Expertly Crafted</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-muted-fg uppercase tracking-widest">
            <CheckCircle className="h-3.5 w-3.5 text-muted-fg opacity-60" />
            <span>Modern Design</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailsTabs({ product }: ProductDetailsTabsProps) {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isLarge: false,
  });

  useEffect(() => {
    // Check screen size immediately and on resize
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < 640,
        isLarge: width >= 1280, // xl breakpoint
      });
    };

    // Use requestAnimationFrame for better performance
    const handleResize = () => {
      requestAnimationFrame(checkScreenSize);
    };

    // Check immediately
    checkScreenSize();

    // Listen for resize events
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { isMobile, isLarge: isLargeScreen } = screenSize;

  const tabs: TabItem[] = useMemo(() => {
    const tabItems: TabItem[] = [];

    // Specifications Tab - NEVER show on xl+ screens (specs are shown separately)
    // Only show on screens smaller than xl breakpoint
    if (product.specs && product.specs.length > 0 && !isLargeScreen) {
      tabItems.push({
        id: "specifications",
        label: isMobile ? "Specs" : "Specifications",
        icon: isMobile ? null : <Settings className="h-4 w-4" />,
        content: <SpecificationsTab product={product} />,
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
  }, [product, isLargeScreen, isMobile]);

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

  return (
    <div className="w-full">
      {/* Responsive tab sizing: smaller on mobile, larger on big screens */}
      <Tabs
        tabs={tabs}
        variant="pill"
        size={isLargeScreen ? "lg" : isMobile ? "sm" : "md"}
        className="transition-all duration-300"
      />
    </div>
  );
}
