import { describe, it, expect } from "@jest/globals";
import { CreateFavoriteSchema } from "./create.schema";

describe("CreateFavoriteSchema", () => {
  it("should validate number input", () => {
    const result = CreateFavoriteSchema.safeParse({ tmdbId: 550 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tmdbId).toBe(550);
    }
  });

  it("should validate string number input", () => {
    const result = CreateFavoriteSchema.safeParse({ tmdbId: "550" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tmdbId).toBe(550);
      expect(typeof result.data.tmdbId).toBe("number");
    }
  });

  it("should reject invalid string", () => {
    const result = CreateFavoriteSchema.safeParse({ tmdbId: "invalid" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "TMDB ID must be a valid number"
      );
    }
  });

  it("should reject missing tmdbId", () => {
    const result = CreateFavoriteSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject null input", () => {
    const result = CreateFavoriteSchema.safeParse({ tmdbId: null });
    expect(result.success).toBe(false);
  });

  it("should reject undefined input", () => {
    const result = CreateFavoriteSchema.safeParse({ tmdbId: undefined });
    expect(result.success).toBe(false);
  });

  it("should handle zero value", () => {
    const result = CreateFavoriteSchema.safeParse({ tmdbId: 0 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tmdbId).toBe(0);
    }
  });

  it("should handle negative numbers", () => {
    const result = CreateFavoriteSchema.safeParse({ tmdbId: -1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tmdbId).toBe(-1);
    }
  });

  it("should handle large numbers", () => {
    const largeNumber = 999999999;
    const result = CreateFavoriteSchema.safeParse({ tmdbId: largeNumber });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tmdbId).toBe(largeNumber);
    }
  });

  it("should convert string with decimal to integer", () => {
    const result = CreateFavoriteSchema.safeParse({ tmdbId: "550.99" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tmdbId).toBe(550);
    }
  });
});
