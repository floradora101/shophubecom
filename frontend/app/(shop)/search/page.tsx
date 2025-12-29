"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/features/products/components/ProductCard";
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
      <Search className="h-12 w-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {query ? "No results found" : "Start searching"}
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-md">
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

  // Caches for results and counts
  const liveResultsCache = useRef<Map<string, Product[]>>(new Map());
  const resultsCountCache = useRef<Map<string, number>>(new Map());

  // Live search results (always shown as user types)
  const [liveResults, setLiveResults] = useState<Product[]>([]);
  const [totalResultsCount, setTotalResultsCount] = useState<number>(0);

  // Load live results when input changes
  useEffect(() => {
    const trimmedInput = inputValue.trim();

    // Clear results if input is empty
    if (!trimmedInput.length) {
      setLiveResults([]);
      return;
    }

    // Check cache first
    if (liveResultsCache.current.has(trimmedInput)) {
      setLiveResults(liveResultsCache.current.get(trimmedInput)!);
      return;
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    fetchResults(trimmedInput, controller.signal)
      .then((fetchedResults) => {
        if (!controller.signal.aborted) {
          liveResultsCache.current.set(trimmedInput, fetchedResults);
          setLiveResults(fetchedResults);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          console.error("Failed to fetch live results:", error);
          setLiveResults([]);
        }
      });
  }, [inputValue]);

  // Load total results count when input changes
  useEffect(() => {
    const trimmedInput = inputValue.trim();

    // Clear count if input is empty
    if (!trimmedInput.length) {
      setTotalResultsCount(0);
      return;
    }

    // Check cache first
    if (resultsCountCache.current.has(trimmedInput)) {
      setTotalResultsCount(resultsCountCache.current.get(trimmedInput)!);
      return;
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    fetchResultsCount(trimmedInput, controller.signal)
      .then((count) => {
        if (!controller.signal.aborted) {
          resultsCountCache.current.set(trimmedInput, count);
          setTotalResultsCount(count);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          console.error("Failed to fetch results count:", error);
          setTotalResultsCount(0);
        }
      });
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
    <div className="min-h-screen bg-white">
      {/* Search Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
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
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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

          {/* Keyboard shortcut hint */}
          <div className="flex items-center justify-center gap-1 mt-3 text-xs text-gray-500">
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
              {isMac ? <Command className="h-3 w-3 inline" /> : "Ctrl"}
            </kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
              K
            </kbd>
            <span>to open search</span>
          </div>
        </Container>
      </div>

      {/* Search Results */}
      <Container className="py-8">
        {inputValue.trim() && liveResults.length > 0 ? (
          // Live search results
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {totalResultsCount} result
                  {totalResultsCount === 1 ? "" : "s"} for &ldquo;{inputValue}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {liveResults.map((product) => (
                <div
                  key={product.id}
                  className="transform scale-95 hover:scale-100 transition-transform cursor-pointer"
                  onClick={() => router.push(`/products/${product.slug}`)}
                >
                  <ProductCard product={product} compact />
                </div>
              ))}
            </div>
          </>
        ) : inputValue.trim() && liveResults.length === 0 ? (
          // No results found
          <EmptyState query={inputValue} />
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
