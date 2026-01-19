import { describe, it, expect } from "vitest";
import { cartKeys } from "../query-keys";

describe("cartKeys", () => {
  it("should have correct base key structure", () => {
    expect(cartKeys.all).toEqual(["cart"]);
  });

  it("should generate correct list keys", () => {
    expect(cartKeys.lists()).toEqual(["cart", "list"]);
  });

  it("should generate correct detail keys", () => {
    expect(cartKeys.details()).toEqual(["cart", "detail"]);
    expect(cartKeys.detail("item-123")).toEqual(["cart", "detail", "item-123"]);
  });

  it("should maintain type safety", () => {
    // TypeScript should enforce correct types
    const key = cartKeys.detail("item-123");
    expect(key).toEqual(["cart", "detail", "item-123"]);
  });

  it("should allow invalidation of all cart queries", () => {
    const allKey = cartKeys.all;
    expect(allKey).toEqual(["cart"]);
  });
});
