"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useReducer,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/features/products/components/ProductCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  mockProducts,
  mockProductToProduct,
  type MockProduct,
} from "@/lib/mock-data/mock-data";
import type { Product } from "@/features/products/types";

async function fetchResultsCount(
  query: string,
  signal?: AbortSignal
): Promise<number> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 50));

  if (signal?.aborted) return 0;

  if (!query.trim()) return 0;

  return mockProducts
    .map((product) => ({
      product: mockProductToProduct(product),
      score: scoreProduct(product, query),
    }))
    .filter((item) => item.score > 0).length;
}

async function fetchResults(
  query: string,
  signal?: AbortSignal,
  limit: number = 8
): Promise<Product[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (signal?.aborted) return [];

  if (!query.trim()) return [];

  return mockProducts
    .map((product) => ({
      product: mockProductToProduct(product),
      score: scoreProduct(product, query),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.product);
}

// Platform detection for keyboard shortcut hint
const isMac =
  typeof navigator !== "undefined" &&
  navigator.platform.toUpperCase().indexOf("MAC") >= 0;

// Mobile detection - hide keyboard shortcuts on touch devices
const isMobile =
  typeof navigator !== "undefined" &&
  (navigator.maxTouchPoints > 0 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    window.innerWidth < 768);

// Normalize text: lowercase, trim, remove punctuation
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, " ") // Replace punctuation with spaces
    .replace(/\s+/g, " ") // Normalize multiple spaces to single space
    .trim();
}

// Tokenize query into words
function tokenizeQuery(query: string): string[] {
  return normalizeText(query)
    .split(" ")
    .filter((token) => token.length > 0);
}

// Score a product against a query with comprehensive matching
function scoreProduct(product: MockProduct, query: string): number {
  const normalizedQuery = normalizeText(query);
  const queryTokens = tokenizeQuery(query);

  if (!normalizedQuery || queryTokens.length === 0) return 0;

  const name = normalizeText(product.name);
  const description = normalizeText(product.description || "");
  const category = normalizeText(product.category || "");

  let score = 0;
  const matchedTokens = new Set<string>();

  // Check each token individually
  for (const token of queryTokens) {
    let tokenScore = 0;

    // Highest weight: name starts with token
    if (name.startsWith(token)) {
      tokenScore += 100;
      matchedTokens.add(token);
    }
    // High weight: name includes token
    else if (name.includes(token)) {
      tokenScore += 50;
      matchedTokens.add(token);
    }

    // Medium weight: category includes token
    if (category.includes(token)) {
      tokenScore += 25;
      matchedTokens.add(token);
    }

    // Low weight: description includes token
    if (description.includes(token)) {
      tokenScore += 10;
      matchedTokens.add(token);
    }

    score += tokenScore;
  }

  // Bonus: full normalized phrase appears in name
  if (name.includes(normalizedQuery)) {
    score += 200;
  }

  // Bonus: ALL tokens match across any fields
  if (matchedTokens.size === queryTokens.length) {
    score += 50;
  }

  return score;
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Search className="h-12 w-12 text-muted-fg mb-4" />
      <h3 className="text-lg font-medium text-fg mb-2">
        {query ? "No results found" : "Start searching"}
      </h3>
      <p className="text-sm text-muted-fg text-center max-w-md">
        {query
          ? `We couldn't find any products matching "${query}". Try adjusting your search terms.`
          : "Search for products by name, category, or description."}
      </p>
    </div>
  );
}

function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Input value for live search
  const initialQuery = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(initialQuery);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const countAbortControllerRef = useRef<AbortController | null>(null);

  // Caches for results and counts
  const liveResultsCache = useRef<Map<string, Product[]>>(new Map());
  const resultsCountCache = useRef<Map<string, number>>(new Map());

  // Search state reducer
  type SearchState = {
    liveResults: Product[];
    totalResultsCount: number;
    isLoadingResults: boolean;
    isLoadingCount: boolean;
  };

  type SearchAction =
    | { type: "CLEAR_RESULTS" }
    | { type: "SET_LOADING_RESULTS"; payload: boolean }
    | { type: "SET_LOADING_COUNT"; payload: boolean }
    | { type: "SET_LIVE_RESULTS"; payload: Product[] }
    | { type: "SET_TOTAL_COUNT"; payload: number };

  const initialSearchState: SearchState = {
    liveResults: [],
    totalResultsCount: 0,
    isLoadingResults: false,
    isLoadingCount: false,
  };

  const searchReducer = (
    state: SearchState,
    action: SearchAction
  ): SearchState => {
    switch (action.type) {
      case "CLEAR_RESULTS":
        return {
          ...state,
          liveResults: [],
          totalResultsCount: 0,
          isLoadingResults: false,
          isLoadingCount: false,
        };
      case "SET_LOADING_RESULTS":
        return { ...state, isLoadingResults: action.payload };
      case "SET_LOADING_COUNT":
        return { ...state, isLoadingCount: action.payload };
      case "SET_LIVE_RESULTS":
        return { ...state, liveResults: action.payload };
      case "SET_TOTAL_COUNT":
        return { ...state, totalResultsCount: action.payload };
      default:
        return state;
    }
  };

  const [searchState, dispatch] = useReducer(searchReducer, initialSearchState);

  // Extract values for easier access
  const { liveResults, totalResultsCount, isLoadingResults, isLoadingCount } =
    searchState;

  // Load live results and count when input changes
  useEffect(() => {
    const trimmedInput = inputValue.trim();

    // Clear results if input is empty
    if (!trimmedInput.length) {
      dispatch({ type: "CLEAR_RESULTS" });
      return;
    }

    // Check cache first for live results
    if (liveResultsCache.current.has(trimmedInput)) {
      dispatch({
        type: "SET_LIVE_RESULTS",
        payload: liveResultsCache.current.get(trimmedInput)!,
      });
      dispatch({ type: "SET_LOADING_RESULTS", payload: false });
    } else {
      // Abort previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      dispatch({ type: "SET_LOADING_RESULTS", payload: true });
      const controller = new AbortController();
      abortControllerRef.current = controller;

      fetchResults(trimmedInput, controller.signal)
        .then((fetchedResults) => {
          if (!controller.signal.aborted) {
            liveResultsCache.current.set(trimmedInput, fetchedResults);
            dispatch({ type: "SET_LIVE_RESULTS", payload: fetchedResults });
            dispatch({ type: "SET_LOADING_RESULTS", payload: false });
          }
        })
        .catch((error) => {
          if (!controller.signal.aborted) {
            console.error("Failed to fetch live results:", error);
            dispatch({ type: "SET_LIVE_RESULTS", payload: [] });
            dispatch({ type: "SET_LOADING_RESULTS", payload: false });
          }
        });
    }

    // Check cache first for count
    if (resultsCountCache.current.has(trimmedInput)) {
      dispatch({
        type: "SET_TOTAL_COUNT",
        payload: resultsCountCache.current.get(trimmedInput)!,
      });
      dispatch({ type: "SET_LOADING_COUNT", payload: false });
    } else {
      // Abort previous count request
      if (countAbortControllerRef.current) {
        countAbortControllerRef.current.abort();
      }

      dispatch({ type: "SET_LOADING_COUNT", payload: true });
      const countController = new AbortController();
      countAbortControllerRef.current = countController;

      fetchResultsCount(trimmedInput, countController.signal)
        .then((count) => {
          if (!countController.signal.aborted) {
            resultsCountCache.current.set(trimmedInput, count);
            dispatch({ type: "SET_TOTAL_COUNT", payload: count });
            dispatch({ type: "SET_LOADING_COUNT", payload: false });
          }
        })
        .catch((error) => {
          if (!countController.signal.aborted) {
            console.error("Failed to fetch results count:", error);
            dispatch({ type: "SET_TOTAL_COUNT", payload: 0 });
            dispatch({ type: "SET_LOADING_COUNT", payload: false });
          }
        });
    }
  }, [inputValue]);

  // Update URL when input changes (for bookmarking)
  useEffect(() => {
    const params = new URLSearchParams();
    if (inputValue.trim()) {
      params.set("q", inputValue);
    }
    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ""}`;
    router.replace(newUrl, { scroll: false });
  }, [inputValue, router]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    // Try to go back, fallback to home
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
          {!isMobile && (
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
                    onClick={() => router.push(`/products/${product.slug}`)}
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
              <EmptyState query={inputValue} />
            )}
          </>
        ) : (
          // Empty state when no input
          <EmptyState query="" />
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
