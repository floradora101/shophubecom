import { describe, it, expect } from "vitest";
import type { AxiosResponse } from "axios";
import type { BackendResponse } from "@/lib/types/api";
import {
  extractResponseData,
  extractPaginatedData,
} from "../response-transformer";

describe("response-transformer", () => {
  describe("extractResponseData", () => {
    it("should extract data from BackendResponse", () => {
      const mockResponse: AxiosResponse<BackendResponse<{ id: string }>> = {
        data: {
          success: true,
          data: { id: "123" },
          timestamp: "2026-01-01T00:00:00Z",
        },
      } as any;

      const result = extractResponseData(mockResponse);
      expect(result).toEqual({ id: "123" });
    });

    it("should throw error for invalid response structure", () => {
      const mockResponse: AxiosResponse<BackendResponse<any>> = {
        data: {
          success: false,
          data: undefined,
          timestamp: "2026-01-01T00:00:00Z",
        },
      } as any;

      expect(() => extractResponseData(mockResponse)).toThrow(
        "Invalid API response structure"
      );
    });
  });

  describe("extractPaginatedData", () => {
    it("should extract paginated data correctly", () => {
      const mockResponse: AxiosResponse<
        BackendResponse<{
          data: string[];
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        }>
      > = {
        data: {
          success: true,
          data: {
            data: ["item1", "item2"],
            total: 2,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
          timestamp: "2026-01-01T00:00:00Z",
        },
      } as any;

      const result = extractPaginatedData(mockResponse);
      expect(result).toEqual({
        data: ["item1", "item2"],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });
});
