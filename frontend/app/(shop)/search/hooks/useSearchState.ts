/**
 * useSearchState Hook
 *
 * Manages search state, results fetching, and caching.
 *
 * Responsibilities:
 * - Search state reducer
 * - Results fetching with abort controllers
 * - Caching results and counts
 * - Loading state management
 */

import { useReducer, useEffect, useRef } from "react";
import { fetchResults, fetchResultsCount } from "@/lib/search/search-api";
import type { Product } from "@/features/products/types";

interface SearchState {
  liveResults: Product[];
  totalResultsCount: number;
  isLoadingResults: boolean;
  isLoadingCount: boolean;
}

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

function searchReducer(
  state: SearchState,
  action: SearchAction
): SearchState {
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
}

interface UseSearchStateReturn extends SearchState {
  // No additional methods needed, state is managed internally
}

/**
 * Hook for managing search state and fetching results
 */
export function useSearchState(query: string): UseSearchStateReturn {
  const [searchState, dispatch] = useReducer(searchReducer, initialSearchState);

  // Refs for abort controllers and caches
  const abortControllerRef = useRef<AbortController | null>(null);
  const countAbortControllerRef = useRef<AbortController | null>(null);
  const liveResultsCache = useRef<Map<string, Product[]>>(new Map());
  const resultsCountCache = useRef<Map<string, number>>(new Map());

  // Load live results and count when query changes
  useEffect(() => {
    const trimmedQuery = query.trim();

    // Clear results if query is empty
    if (!trimmedQuery.length) {
      dispatch({ type: "CLEAR_RESULTS" });
      return;
    }

    // Check cache first for live results
    if (liveResultsCache.current.has(trimmedQuery)) {
      dispatch({
        type: "SET_LIVE_RESULTS",
        payload: liveResultsCache.current.get(trimmedQuery)!,
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

      fetchResults(trimmedQuery, controller.signal)
        .then((fetchedResults) => {
          if (!controller.signal.aborted) {
            liveResultsCache.current.set(trimmedQuery, fetchedResults);
            dispatch({ type: "SET_LIVE_RESULTS", payload: fetchedResults });
            dispatch({ type: "SET_LOADING_RESULTS", payload: false });
          }
        })
        .catch((error) => {
          if (!controller.signal.aborted) {
            // Error handled silently - search failures are non-critical
            dispatch({ type: "SET_LIVE_RESULTS", payload: [] });
            dispatch({ type: "SET_LOADING_RESULTS", payload: false });
          }
        });
    }

    // Check cache first for count
    if (resultsCountCache.current.has(trimmedQuery)) {
      dispatch({
        type: "SET_TOTAL_COUNT",
        payload: resultsCountCache.current.get(trimmedQuery)!,
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

      fetchResultsCount(trimmedQuery, countController.signal)
        .then((count) => {
          if (!countController.signal.aborted) {
            resultsCountCache.current.set(trimmedQuery, count);
            dispatch({ type: "SET_TOTAL_COUNT", payload: count });
            dispatch({ type: "SET_LOADING_COUNT", payload: false });
          }
        })
        .catch((error) => {
          if (!countController.signal.aborted) {
            // Error handled silently - search count failures are non-critical
            dispatch({ type: "SET_TOTAL_COUNT", payload: 0 });
            dispatch({ type: "SET_LOADING_COUNT", payload: false });
          }
        });
    }
  }, [query]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (countAbortControllerRef.current) {
        countAbortControllerRef.current.abort();
      }
    };
  }, []);

  return searchState;
}
