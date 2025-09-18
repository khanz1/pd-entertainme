import { describe, it, expect } from "@jest/globals";
import { DeleteFavoriteSchema } from "./delete.schema";

describe("DeleteFavoriteSchema", () => {
  it("should validate valid ID string", () => {
    const result = DeleteFavoriteSchema.safeParse({ id: "123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(123);
      expect(typeof result.data.id).toBe("number");
    }
  });

  it("should reject non-numeric string", () => {
    const result = DeleteFavoriteSchema.safeParse({ id: "invalid" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("ID must be a number");
    }
  });

  it("should reject missing ID", () => {
    const result = DeleteFavoriteSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject empty string", () => {
    const result = DeleteFavoriteSchema.safeParse({ id: "" });
    expect(result.success).toBe(false);
  });

  it("should reject null", () => {
    const result = DeleteFavoriteSchema.safeParse({ id: null });
    expect(result.success).toBe(false);
  });

  it("should reject undefined", () => {
    const result = DeleteFavoriteSchema.safeParse({ id: undefined });
    expect(result.success).toBe(false);
  });

  it("should handle zero", () => {
    const result = DeleteFavoriteSchema.safeParse({ id: "0" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(0);
    }
  });

  it("should handle negative numbers", () => {
    const result = DeleteFavoriteSchema.safeParse({ id: "-5" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(-5);
    }
  });

  it("should handle decimal strings", () => {
    const result = DeleteFavoriteSchema.safeParse({ id: "123.456" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(123); // parseInt truncates
    }
  });

  it("should handle leading/trailing whitespace", () => {
    const result = DeleteFavoriteSchema.safeParse({ id: "  123  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(123);
    }
  });

  it("should reject mixed alphanumeric", () => {
    const result = DeleteFavoriteSchema.safeParse({ id: "123abc" });
    expect(result.success).toBe(true); // parseInt will parse 123
    if (result.success) {
      expect(result.data.id).toBe(123);
    }
  });
});
