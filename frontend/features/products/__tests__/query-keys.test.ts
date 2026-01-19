import { describe, it, expect } from "vitest";
import { productKeys } from "../query-keys";

describe("productKeys", () => {
  it("should have correct base key structure", () => {
    expect(productKeys.all).toEqual(["products"]);
  });

  it("should generate correct list keys", () => {
    expect(productKeys.lists()).toEqual(["products", "list"]);
  });

  it("should generate correct list keys with filters", () => {
    const filters = { page: 1, limit: 20, categoryId: "cat-1" };
    expect(productKeys.list(filters)).toEqual([
      "products",
      "list",
      filters,
    ]);
  });

  it("should generate correct detail keys", () => {
    expect(productKeys.details()).toEqual(["products", "detail"]);
    expect(productKeys.detail("product-slug")).toEqual([
      "products",
      "detail",
      "product-slug",
    ]);
  });

  it("should allow invalidation of all product queries", () => {
    const allKey = productKeys.all;
    expect(allKey).toEqual(["products"]);
  });
});
