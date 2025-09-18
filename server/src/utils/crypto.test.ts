import { describe, it, expect } from "@jest/globals";
import {
  signToken,
  verifyToken,
  hashPassword,
  comparePassword,
} from "./crypto";
import jwt from "jsonwebtoken";
import { Env } from "../config/env";

describe("Crypto Utils", () => {
  describe("signToken", () => {
    it("should create a valid JWT token", () => {
      const payload = { id: 1, email: "test@example.com" };
      const token = signToken(payload);

      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT format

      // Verify token can be decoded
      const decoded = jwt.verify(token, Env.JWT_SECRET) as any;
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });

    it("should include expiration in token", () => {
      const payload = { id: 1 };
      const token = signToken(payload);

      const decoded = jwt.verify(token, Env.JWT_SECRET) as any;
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });
  });

  describe("verifyToken", () => {
    it("should verify and decode a valid token", () => {
      const payload = { id: 1, email: "test@example.com" };
      const token = signToken(payload);

      const decoded = verifyToken<typeof payload>(token);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });

    it("should throw error for invalid token", () => {
      expect(() => {
        verifyToken("invalid.token.here");
      }).toThrow();
    });

    it("should throw error for expired token", () => {
      const expiredToken = jwt.sign({ id: 1 }, Env.JWT_SECRET, {
        expiresIn: -1,
      });

      expect(() => {
        verifyToken(expiredToken);
      }).toThrow();
    });

    it("should throw error for token with wrong secret", () => {
      const token = jwt.sign({ id: 1 }, "wrong-secret");

      expect(() => {
        verifyToken(token);
      }).toThrow();
    });
  });

  describe("hashPassword", () => {
    it("should hash password correctly", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50); // bcrypt hash length
    });

    it("should create different hashes for same password", async () => {
      const password = "testPassword123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Salt makes them different
    });
  });

  describe("comparePassword", () => {
    it("should return true for correct password", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);

      const result = await comparePassword(password, hash);
      expect(result).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const password = "testPassword123";
      const wrongPassword = "wrongPassword";
      const hash = await hashPassword(password);

      const result = await comparePassword(wrongPassword, hash);
      expect(result).toBe(false);
    });

    it("should return false for invalid hash", async () => {
      const password = "testPassword123";
      const invalidHash = "invalid-hash";

      const result = await comparePassword(password, invalidHash);
      expect(result).toBe(false);
    });
  });
});
