import { filterActiveSlides } from "./heroSlides.utils";
import type { HeroSlide } from "@/lib/types/heroSlides.types";

/**
 * Unit tests for filterActiveSlides function
 * Tests edge cases for date filtering logic
 */

// Mock data for testing
const createMockSlide = (
  id: string,
  startsAt?: string,
  endsAt?: string,
  isActive = true
): HeroSlide => ({
  id,
  type: "PRODUCT_SPOTLIGHT",
  priority: 1,
  isActive,
  headline: "Test Headline",
  description: "Test Description",
  ctaPrimary: { label: "Test CTA", href: "/test" },
  media: { kind: "image", imageUrl: "/test.jpg", alt: "Test" },
  startsAt,
  endsAt,
});

describe("filterActiveSlides", () => {
  const now = new Date("2024-01-15T12:00:00.000Z"); // Fixed test date

  it("should return empty array for invalid input", () => {
    expect(filterActiveSlides(null as unknown, now)).toEqual([]);
    expect(filterActiveSlides(undefined as unknown, now)).toEqual([]);
    expect(filterActiveSlides("invalid" as unknown, now)).toEqual([]);
    expect(filterActiveSlides({}, now)).toEqual([]);
  });

  it("should filter out inactive slides", () => {
    const slides = [
      createMockSlide("active", undefined, undefined, true),
      createMockSlide("inactive", undefined, undefined, false),
    ];

    const result = filterActiveSlides(slides, now);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("active");
  });

  it("should include slides with no date restrictions", () => {
    const slides = [
      createMockSlide("no-dates"), // No startsAt or endsAt
    ];

    const result = filterActiveSlides(slides, now);
    expect(result).toHaveLength(1);
  });

  it("should handle missing startsAt as -infinity (no start restriction)", () => {
    const slides = [
      createMockSlide("no-start", undefined, "2024-01-20T00:00:00.000Z"), // Only endsAt
    ];

    const result = filterActiveSlides(slides, now);
    expect(result).toHaveLength(1); // Should be active since no start restriction
  });

  it("should handle missing endsAt as +infinity (no end restriction)", () => {
    const slides = [
      createMockSlide("no-end", "2024-01-10T00:00:00.000Z", undefined), // Only startsAt
    ];

    const result = filterActiveSlides(slides, now);
    expect(result).toHaveLength(1); // Should be active since no end restriction
  });

  it("should filter out slides that haven't started yet", () => {
    const slides = [
      createMockSlide("future-start", "2024-01-20T00:00:00.000Z", undefined), // Starts in future
    ];

    const result = filterActiveSlides(slides, now);
    expect(result).toHaveLength(0);
  });

  it("should filter out slides that have expired", () => {
    const slides = [
      createMockSlide("expired", undefined, "2024-01-10T00:00:00.000Z"), // Ended in past
    ];

    const result = filterActiveSlides(slides, now);
    expect(result).toHaveLength(0);
  });

  it("should include slides active during the current time", () => {
    const slides = [
      createMockSlide(
        "active-range",
        "2024-01-10T00:00:00.000Z",
        "2024-01-20T00:00:00.000Z"
      ),
    ];

    const result = filterActiveSlides(slides, now);
    expect(result).toHaveLength(1);
  });

  it("should handle exact boundary dates (inclusive)", () => {
    const slides = [
      createMockSlide(
        "starts-now",
        "2024-01-15T12:00:00.000Z",
        "2024-01-20T00:00:00.000Z"
      ), // Starts exactly at now
      createMockSlide(
        "ends-now",
        "2024-01-10T00:00:00.000Z",
        "2024-01-15T12:00:00.000Z"
      ), // Ends exactly at now
    ];

    const result = filterActiveSlides(slides, now);
    expect(result).toHaveLength(2); // Both should be included (inclusive bounds)
  });

  it("should handle timezone-agnostic ISO parsing", () => {
    // Test with different timezone representations but same moment
    const slides = [
      createMockSlide(
        "utc-zulu",
        "2024-01-10T00:00:00.000Z",
        "2024-01-20T00:00:00.000Z"
      ),
      createMockSlide(
        "utc-plus",
        "2024-01-10T00:00:00+00:00",
        "2024-01-20T00:00:00+00:00"
      ),
    ];

    const result = filterActiveSlides(slides, now);
    expect(result).toHaveLength(2); // Both should be treated identically
  });

  it("should use current time when no date provided", () => {
    const slides = [createMockSlide("no-restriction")];

    // Test with default now parameter
    const result = filterActiveSlides(slides);
    expect(result).toHaveLength(1);
  });

  it("should handle multiple slides with mixed states", () => {
    const slides = [
      createMockSlide("active-no-dates", undefined, undefined, true),
      createMockSlide("inactive", undefined, undefined, false),
      createMockSlide("future", "2024-01-20T00:00:00.000Z", undefined, true),
      createMockSlide("expired", undefined, "2024-01-10T00:00:00.000Z", true),
      createMockSlide(
        "active-range",
        "2024-01-10T00:00:00.000Z",
        "2024-01-20T00:00:00.000Z",
        true
      ),
    ];

    const result = filterActiveSlides(slides, now);
    expect(result).toHaveLength(2); // Only active-no-dates and active-range
    expect(result.map((s) => s.id)).toEqual([
      "active-no-dates",
      "active-range",
    ]);
  });

  it("should handle edge case of zero-length active period", () => {
    // Same start and end time (edge case)
    const slides = [
      createMockSlide(
        "zero-duration",
        "2024-01-15T12:00:00.000Z",
        "2024-01-15T12:00:00.000Z"
      ),
    ];

    const result = filterActiveSlides(slides, now);
    expect(result).toHaveLength(1); // Should be active at exact time
  });

  it("should handle invalid date strings gracefully", () => {
    // Invalid dates should be treated as missing (infinity)
    const slides = [
      createMockSlide(
        "invalid-start",
        "invalid-date",
        "2024-01-20T00:00:00.000Z"
      ),
      createMockSlide(
        "invalid-end",
        "2024-01-10T00:00:00.000Z",
        "invalid-date"
      ),
    ];

    const result = filterActiveSlides(slides, now);
    expect(result).toHaveLength(2); // Both should be treated as having no restrictions on the invalid side
  });
});
