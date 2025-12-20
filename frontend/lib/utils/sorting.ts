/**
 * Generic sorting utilities
 * Provides reusable sorting functions for different data types
 */

type SortOrder = "asc" | "desc";

/**
 * Creates a generic sort function for any object type
 * @param sortBy - The field to sort by (must be a key of T)
 * @param sortOrder - The sort order (ascending or descending)
 * @returns A comparison function for Array.sort()
 */
export function createSortFunction<T>(
  sortBy: keyof T,
  sortOrder: SortOrder
): (a: T, b: T) => number {
  return (a: T, b: T) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    // Handle null/undefined values
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    // Handle numbers
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }

    // Handle dates (strings that can be parsed as dates)
    if (typeof aVal === "string" && typeof bVal === "string") {
      const aDate = new Date(aVal).getTime();
      const bDate = new Date(bVal).getTime();
      if (!isNaN(aDate) && !isNaN(bDate)) {
        return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
      }
    }

    // Handle strings (case-insensitive)
    const aStr = String(aVal ?? "").toLowerCase();
    const bStr = String(bVal ?? "").toLowerCase();

    if (sortOrder === "asc") {
      return aStr > bStr ? 1 : aStr < bStr ? -1 : 0;
    }
    return aStr < bStr ? 1 : aStr > bStr ? -1 : 0;
  };
}

/**
 * Creates a sort function with custom value extraction
 * Useful for sorting by computed or nested values
 * @param getValue - Function to extract the value to sort by
 * @param sortOrder - The sort order (ascending or descending)
 * @returns A comparison function for Array.sort()
 */
export function createCustomSortFunction<T>(
  getValue: (item: T) => number | string | Date | null | undefined,
  sortOrder: SortOrder
): (a: T, b: T) => number {
  return (a: T, b: T) => {
    const aVal = getValue(a);
    const bVal = getValue(b);

    // Handle null/undefined values
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    // Handle numbers
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }

    // Handle dates
    if (aVal instanceof Date && bVal instanceof Date) {
      return sortOrder === "asc"
        ? aVal.getTime() - bVal.getTime()
        : bVal.getTime() - aVal.getTime();
    }

    // Handle strings (case-insensitive)
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();

    if (sortOrder === "asc") {
      return aStr > bStr ? 1 : aStr < bStr ? -1 : 0;
    }
    return aStr < bStr ? 1 : aStr > bStr ? -1 : 0;
  };
}
