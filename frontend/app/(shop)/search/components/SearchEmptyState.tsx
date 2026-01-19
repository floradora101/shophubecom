/**
 * SearchEmptyState Component
 *
 * Displays empty state for search results.
 */

import { Search } from "lucide-react";

interface SearchEmptyStateProps {
  query: string;
}

export function SearchEmptyState({ query }: SearchEmptyStateProps) {
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
