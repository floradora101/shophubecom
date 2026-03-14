import { describe, it, expect } from "vitest";
import { cartKeys } from "../query-keys";

describe("cartKeys", () => {
  it("should have correct base key structure", () => {
    expect(cartKeys.all).toEqual(["cart"]);
  });

  it("should allow invalidation of all cart queries", () => {
    const allKey = cartKeys.all;
    expect(allKey).toEqual(["cart"]);
  });

  it("should be usable for queryClient.invalidateQueries", () => {
    const queryKey = cartKeys.all;
    expect(Array.isArray(queryKey)).toBe(true);
    expect(queryKey).toContain("cart");
  });
});
