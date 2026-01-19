/**
 * Search Utilities
 *
 * Text normalization, tokenization, and product scoring functions.
 */

import type { MockProduct } from "@/lib/mock-data/mock-data";

/**
 * Normalize text: lowercase, trim, remove punctuation
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, " ") // Replace punctuation with spaces
    .replace(/\s+/g, " ") // Normalize multiple spaces to single space
    .trim();
}

/**
 * Tokenize query into words
 */
export function tokenizeQuery(query: string): string[] {
  return normalizeText(query)
    .split(" ")
    .filter((token) => token.length > 0);
}

/**
 * Score a product against a query with comprehensive matching
 *
 * Scoring weights:
 * - Full phrase match in name: +200
 * - Name starts with token: +100
 * - Name includes token: +50
 * - Category includes token: +25
 * - Description includes token: +10
 * - All tokens match: +50 bonus
 */
export function scoreProduct(product: MockProduct, query: string): number {
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
