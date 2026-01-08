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
  PenTool,
  Settings,
} from "lucide-react";
import { Tabs, TabItem } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Product } from "@/features/products/types";
import {
  mockReviews,
  mockReviewStats,
  type Review,
  type ReviewStats,
} from "@/lib/mock-data/mock-reviews";
import { cn } from "@/lib/utils/cn";
import { WriteReviewModal } from "./WriteReviewModal";

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
    <Card variant="default" padding="lg" className="shadow-sm bg-transparent">
      <div className="space-y-4">
        {/* Header with user info and rating */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary-100">
              <AvatarImage src={review.userAvatar} alt={review.userName} />
              <AvatarFallback className="bg-primary-100 text-primary-600">
                {review.userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground truncate">
                  {review.userName}
                </span>
                {review.verified && (
                  <Badge variant="success" className="text-xs px-2 py-0.5">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <StarRating
                  rating={review.rating}
                  size="sm"
                  showCount={false}
                />
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(review.date)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Review title */}
        <div>
          <h4 className="font-semibold text-foreground mb-2">{review.title}</h4>
        </div>

        {/* Review content */}
        <div className="space-y-3">
          <p className="text-foreground leading-relaxed text-sm">
            {displayContent}
          </p>

          {shouldTruncate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-auto p-0 text-primary-600 hover:text-primary-600 hover:bg-primary-50"
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
            <div className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded-lg">
              <span className="font-medium">Purchased:</span>{" "}
              {review.productVariant}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// Reviews Summary Component
function ReviewsSummary({ stats }: { stats: ReviewStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Overall Rating Card */}
      <Card padding="lg" className="bg-muted">
        <div className="text-center space-y-4">
          <div className="text-4xl font-bold text-foreground">
            {stats.averageRating}
          </div>
          <StarRating
            rating={stats.averageRating}
            size="lg"
            showCount={false}
          />
          <div className="text-sm text-muted-foreground">
            Based on {stats.totalReviews} reviews
          </div>
          <div className="text-xs text-muted-foreground">
            {stats.verifiedReviews} verified purchases
          </div>
        </div>
      </Card>

      {/* Rating Distribution */}
      <Card padding="lg" className="bg-transparent">
        <h4 className="font-semibold text-foreground mb-4">Rating Breakdown</h4>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count =
              stats.ratingDistribution[
                rating as keyof typeof stats.ratingDistribution
              ];
            const percentage = (count / stats.totalReviews) * 100;
            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 min-w-[60px]">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="h-3 w-3 fill-current text-primary" />
                </div>
                <Progress value={percentage} className="flex-1 h-2" />
                <span className="text-xs text-muted-foreground min-w-[30px]">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
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
    console.log("Submitting review:", reviewData);

    // For demo purposes, we'll just show an alert
    alert(
      "Thank you for your review! In a real application, this would be saved to the database."
    );

    // You could also update the local state to show the new review immediately
    // const newReview: Review = {
    //   id: `review-${Date.now()}`,
    //   userId: reviewData.userEmail,
    //   userName: reviewData.userName,
    //   rating: reviewData.rating,
    //   title: reviewData.content.substring(0, 50) + "...", // Generate title from content
    //   content: reviewData.content,
    //   date: new Date(),
    //   verified: false,
    //   helpful: 0,
    //   productVariant: "Your Purchase"
    // };
  };

  return (
    <>
      <div className="space-y-6">
        {/* Reviews Summary */}
        <ReviewsSummary stats={stats} />

        {/* Reviews Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Customer Reviews ({stats.totalReviews})
          </h3>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowWriteReviewModal(true)}
              variant="outline"
              size="sm"
            >
              <PenTool className="h-4 w-4 mr-2" />
              Write Review
            </Button>

            {/* Sort Dropdown - Consistent with products page */}
            <div className="relative" ref={sortRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="gap-2"
                aria-expanded={isSortOpen}
                aria-haspopup="true"
              >
                <span>
                  {sortBy === "newest" && "Newest First"}
                  {sortBy === "oldest" && "Oldest First"}
                  {sortBy === "highest" && "Highest Rated"}
                  {sortBy === "lowest" && "Lowest Rated"}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
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
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="px-6"
            >
              {showAllReviews
                ? "Show Less Reviews"
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
      <div className="text-center py-12">
        <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          No Specifications Available
        </h3>
        <p className="text-muted-foreground">
          Specifications for this product are not currently available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-surface rounded-xl border border-border/40 overflow-hidden">
        <div className="divide-y divide-border/30">
          {product.specs.map((spec, index) => (
            <div
              key={index}
              className="group px-4 py-3 hover:bg-surface-muted/50 transition-colors duration-200"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-muted-fg flex-1 min-w-0">
                  {spec.label}
                </span>
                <span className="text-sm font-semibold text-fg flex-1 min-w-0 text-right">
                  {spec.value}
                </span>
              </div>
            </div>
          ))}
        </div>
        {/* Compact footer accent */}
        <div className="h-1 bg-linear-to-r from-primary/20 via-primary/40 to-primary/20" />
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
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          No Description Available
        </h3>
        <p className="text-muted-foreground">
          A description for this product is not currently available.
        </p>
      </div>
    );
  }

  return (
    <Card padding="lg" className="prose prose-sm max-w-none bg-transparent">
      <div className="text-foreground leading-relaxed whitespace-pre-line">
        {description}
      </div>
    </Card>
  );
}

export function ProductDetailsTabs({ product }: ProductDetailsTabsProps) {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    // Check screen size immediately and on resize
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsLargeScreen(width >= 1280); // xl breakpoint
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

  const tabs: TabItem[] = useMemo(() => {
    const tabItems: TabItem[] = [];

    // Specifications Tab - NEVER show on xl+ screens (specs are shown separately)
    // Only show on screens smaller than xl breakpoint
    if (product.specs && product.specs.length > 0 && !isLargeScreen) {
      tabItems.push({
        id: "specifications",
        label: "Specifications",
        icon: <Settings className="h-4 w-4" />,
        content: <SpecificationsTab product={product} />,
      });
    }

    // Description Tab
    if (product.description) {
      tabItems.push({
        id: "description",
        label: "Description",
        icon: <FileText className="h-4 w-4" />,
        content: <DescriptionTab product={product} />,
      });
    }

    // Reviews Tab
    tabItems.push({
      id: "reviews",
      label: "Reviews",
      icon: <Star className="h-4 w-4" />,
      badge: mockReviewStats.totalReviews,
      content: <ReviewsTab product={product} />,
    });

    return tabItems;
  }, [product]);

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
      {/* Additional CSS safeguard: hide specs tab on xl+ screens */}
      <div className="sm:hidden">
        <Tabs tabs={tabs} variant="pill" size="sm" />
      </div>
      <div className="hidden sm:block xl:hidden">
        <Tabs tabs={tabs} variant="pill" size="md" />
      </div>
      <div className="hidden xl:block">
        <Tabs
          tabs={tabs.filter((tab) => tab.id !== "specifications")} // Never show specs on xl+
          variant="pill"
          size="lg"
        />
      </div>
    </div>
  );
}
