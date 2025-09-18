import { describe, it, expect } from "@jest/globals";
import { GetMovieSchema, GetMovieByIdSchema } from "./get-movie.schema";

describe("Movie Schema Validation", () => {
  describe("GetMovieSchema", () => {
    it("should validate valid movie query parameters", () => {
      const validData = {
        page: "1",
        type: "popular",
        search: "test movie",
      };

      const result = GetMovieSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.type).toBe("popular");
        expect(result.data.search).toBe("test movie");
      }
    });

    it("should use default values when not provided", () => {
      const result = GetMovieSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.type).toBe("popular");
        expect(result.data.search).toBeUndefined();
      }
    });

    it("should convert string page to number", () => {
      const result = GetMovieSchema.safeParse({ page: "5" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(5);
        expect(typeof result.data.page).toBe("number");
      }
    });

    it("should validate all allowed movie types except search", () => {
      const types = ["popular", "top_rated", "upcoming", "now_playing"];

      types.forEach((type) => {
        const result = GetMovieSchema.safeParse({ type });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.type).toBe(type);
        }
      });
    });

    it("should validate search type with search query", () => {
      const result = GetMovieSchema.safeParse({
        type: "search",
        search: "test movie",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("search");
        expect(result.data.search).toBe("test movie");
      }
    });

    it("should reject invalid movie type", () => {
      const result = GetMovieSchema.safeParse({ type: "invalid_type" });
      expect(result.success).toBe(false);
    });

    it("should handle optional search parameter", () => {
      const withSearch = GetMovieSchema.safeParse({ search: "test" });
      const withoutSearch = GetMovieSchema.safeParse({});

      expect(withSearch.success).toBe(true);
      expect(withoutSearch.success).toBe(true);
    });

    it("should handle invalid page number", () => {
      const result = GetMovieSchema.safeParse({ page: "invalid" });
      expect(result.success).toBe(true); // Will parse as NaN, then convert
      if (result.success) {
        expect(isNaN(result.data.page)).toBe(true);
      }
    });
  });

  describe("GetMovieByIdSchema", () => {
    it("should validate valid movie ID", () => {
      const result = GetMovieByIdSchema.safeParse({ id: "123" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(123);
        expect(typeof result.data.id).toBe("number");
      }
    });

    it("should convert string ID to number", () => {
      const result = GetMovieByIdSchema.safeParse({ id: "550" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(550);
      }
    });

    it("should reject invalid ID format", () => {
      const result = GetMovieByIdSchema.safeParse({ id: "invalid" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("ID must be a number");
      }
    });

    it("should reject non-string input", () => {
      const result = GetMovieByIdSchema.safeParse({ id: 123 });
      expect(result.success).toBe(false);
    });

    it("should reject missing ID", () => {
      const result = GetMovieByIdSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should reject empty string ID", () => {
      const result = GetMovieByIdSchema.safeParse({ id: "" });
      expect(result.success).toBe(false);
    });

    it("should handle decimal numbers in string", () => {
      const result = GetMovieByIdSchema.safeParse({ id: "123.456" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(123); // parseInt truncates
      }
    });
  });
});
