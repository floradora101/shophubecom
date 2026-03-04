"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/shared/ProductCard";
import { LoadingSpinner } from "@/components/ui/spinner";
import { usePlatformDetection } from "./hooks/usePlatformDetection";
import { useSearchState } from "./hooks/useSearchState";
import { useSearchInput } from "./hooks/useSearchInput";
import { SearchEmptyState } from "./components/SearchEmptyState";
import { productRoutes } from "@/lib/routes";

function SearchPage() {
  const router = useRouter();
  const { isMac, isMobile } = usePlatformDetection();

  // Extract search input logic
  const { inputValue, inputRef, handleInputChange, handleClose } =
    useSearchInput();

  // Extract search state management
  const { liveResults, totalResultsCount, isLoadingResults, isLoadingCount } =
    useSearchState(inputValue);

  return (
    <div className="min-h-screen bg-surface">
      {/* Search Header */}
      <div className="sticky top-0 z-50 bg-surface border-b border-border shadow-sm">
        <Container className="py-4">
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="relative">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search products..."
                  value={inputValue}
                  onChange={handleInputChange}
                  className="h-12 text-lg pl-12 pr-4"
                  aria-label="Search products"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-fg" />
              </div>
            </div>

            {/* Close Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleClose}
              aria-label="Close search"
              className="h-12 w-12"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Keyboard shortcut hint - hidden on mobile */}
          {!isMobile && isMac !== undefined && (
            <div className="flex items-center justify-center gap-1 mt-3 text-xs text-muted-fg">
              <kbd className="px-2 py-1 bg-surface-muted border border-border rounded text-xs font-mono">
                {isMac ? <Command className="h-3 w-3 inline" /> : "Ctrl"}
              </kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-surface-muted border border-border rounded text-xs font-mono">
                K
              </kbd>
              <span>to open search</span>
            </div>
          )}
        </Container>
      </div>

      {/* Search Results */}
      <Container className="py-8">
        {inputValue.trim() ? (
          // Show search results or loading state
          <>
            {!isLoadingResults && !isLoadingCount && (
              <div className="mb-6">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-fg">
                    {totalResultsCount} result
                    {totalResultsCount === 1 ? "" : "s"} for &ldquo;
                    {inputValue}
                    &rdquo;
                  </h2>
                  {totalResultsCount >= 2 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/search/results?q=${encodeURIComponent(inputValue)}`
                        )
                      }
                      className="gap-2"
                    >
                      View all results ({totalResultsCount})
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {isLoadingResults || isLoadingCount ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner
                  variant="card"
                  size="lg"
                  message="Searching for products..."
                />
              </div>
            ) : liveResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {liveResults.map((product) => (
                  <div
                    key={product.id}
                    className="transform scale-95 hover:scale-100 transition-transform cursor-pointer"
                    onClick={() => router.push(productRoutes.detail(product.slug))}
                  >
                    <ProductCard
                      product={product}
                      compact
                      layout="horizontal"
                    />
                  </div>
                ))}
              </div>
            ) : (
              // No results found - only show when not loading
              <SearchEmptyState query={inputValue} />
            )}
          </>
        ) : (
          // Empty state when no input
          <SearchEmptyState query="" />
        )}
      </Container>
    </div>
  );
}

// Wrapper component with Suspense boundary
export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPage />
    </Suspense>
  );
}
