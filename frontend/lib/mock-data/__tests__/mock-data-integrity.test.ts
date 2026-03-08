/**
 * Mock data referential integrity tests.
 *
 * Validates that mock products, categories, and related data are internally
 * consistent: no duplicate ids/slugs, all product categorySlug references
 * resolve to existing categories.
 *
 * The validation runs at module load; this test ensures it's exercised in CI.
 */
import { describe, it, expect } from "vitest";
import {
  validateMockCatalogIntegrity,
  mockCategories,
  mockProducts,
  getAllCategories,
  getAllProducts,
} from "../mock-data";

describe("mock-data integrity", () => {
  it("runs validateMockCatalogIntegrity without throwing", () => {
    expect(() => validateMockCatalogIntegrity()).not.toThrow();
  });

  it("has unique category ids and slugs", () => {
    const ids = new Set<string>();
    const slugs = new Set<string>();
    for (const c of mockCategories) {
      expect(ids.has(c.id)).toBe(false);
      expect(slugs.has(c.slug)).toBe(false);
      ids.add(c.id);
      slugs.add(c.slug);
    }
  });

  it("has unique product ids and slugs (normalized)", () => {
    const ids = new Set<string>();
    const slugs = new Set<string>();
    for (const p of mockProducts) {
      const id = p.id ?? p.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const slug = p.slug ?? id;
      expect(ids.has(id)).toBe(false);
      expect(slugs.has(slug)).toBe(false);
      ids.add(id);
      slugs.add(slug);
    }
  });

  it("has all product categorySlug references resolve to existing categories", () => {
    const categorySlugs = new Set(mockCategories.map((c) => c.slug));
    for (const p of mockProducts) {
      const slug = p.categorySlug;
      if (slug) {
        expect(categorySlugs.has(slug), `Product "${p.name}" references missing category "${slug}"`).toBe(true);
      }
    }
  });

  it("getAllCategories and getAllProducts return data", () => {
    const categories = getAllCategories();
    const products = getAllProducts();
    expect(categories.length).toBeGreaterThan(0);
    expect(products.length).toBeGreaterThan(0);
  });
});
