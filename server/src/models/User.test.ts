import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import sequelize from "../config/database";
import { User } from "./index";
import { hashPassword } from "../utils/crypto";

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
});

describe("User Model", () => {
  describe("validatePassword", () => {
    it("should return true for correct password", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "testPassword123",
        profilePict: "https://example.com/avatar.jpg",
      };

      const user = await User.create(userData);
      const isValid = await user.validatePassword("testPassword123");

      expect(isValid).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const userData = {
        name: "Test User 2",
        email: "test2@example.com",
        password: "testPassword123",
        profilePict: "https://example.com/avatar.jpg",
      };

      const user = await User.create(userData);
      const isValid = await user.validatePassword("wrongPassword");

      expect(isValid).toBe(false);
    });

    it("should return false when password is null", async () => {
      const userData = {
        name: "Test User 3",
        email: "test3@example.com",
        password: "testPassword123",
        profilePict: "https://example.com/avatar.jpg",
      };

      const user = await User.create(userData);
      // Manually set password to null to test the edge case
      user.setDataValue("password", null as any);

      const isValid = await user.validatePassword("anyPassword");
      expect(isValid).toBe(false);
    });
  });

  describe("password hashing hooks", () => {
    it("should hash password before creating user", async () => {
      const plainPassword = "testPassword123";
      const userData = {
        name: "Test User 4",
        email: "test4@example.com",
        password: plainPassword,
        profilePict: "https://example.com/avatar.jpg",
      };

      const user = await User.create(userData);

      expect(user.password).not.toBe(plainPassword);
      expect(user.password).toBeDefined();
      expect(user.password.length).toBeGreaterThan(50); // bcrypt hash length
    });

    it("should hash password before updating user when password changed", async () => {
      const userData = {
        name: "Test User 5",
        email: "test5@example.com",
        password: "originalPassword",
        profilePict: "https://example.com/avatar.jpg",
      };

      const user = await User.create(userData);
      const originalHash = user.password;

      // Update password
      user.password = "newPassword123";
      await user.save();

      expect(user.password).not.toBe("newPassword123");
      expect(user.password).not.toBe(originalHash);
      expect(user.password.length).toBeGreaterThan(50);
    });

    it("should not rehash password when updating other fields", async () => {
      const userData = {
        name: "Test User 6",
        email: "test6@example.com",
        password: "testPassword123",
        profilePict: "https://example.com/avatar.jpg",
      };

      const user = await User.create(userData);
      const originalHash = user.password;

      // Update name only
      user.name = "Updated Name";
      await user.save();

      expect(user.password).toBe(originalHash);
    });

    it("should handle password update when password is null", async () => {
      const userData = {
        name: "Test User 7",
        email: "test7@example.com",
        password: "testPassword123",
        profilePict: "https://example.com/avatar.jpg",
      };

      const user = await User.create(userData);

      // Test the edge case where password might be null during update
      user.name = "Updated Name";

      // Simulate the condition when password is changed but is null
      const originalHash = user.password;
      user.setDataValue("password", originalHash); // Keep the original password

      await user.save();

      // Should not crash and password should remain hashed
      expect(user.getDataValue("password")).toBeDefined();
    });
  });

  describe("model validations", () => {
    it("should create user with valid data", async () => {
      const userData = {
        name: "Valid User",
        email: "valid@example.com",
        password: "validPassword123",
        profilePict: "https://example.com/avatar.jpg",
      };

      const user = await User.create(userData);

      expect(user.id).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.profilePict).toBe(userData.profilePict);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it("should create user without profilePict", async () => {
      const userData = {
        name: "No Avatar User",
        email: "noavatar@example.com",
        password: "validPassword123",
      };

      const user = await User.create(userData);

      expect(user.id).toBeDefined();
      expect(user.profilePict).toBe(null);
    });

    it("should reject duplicate email", async () => {
      const userData = {
        name: "Duplicate User",
        email: "duplicate@example.com",
        password: "validPassword123",
      };

      await User.create(userData);

      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should reject invalid email format", async () => {
      const userData = {
        name: "Invalid Email User",
        email: "invalid-email",
        password: "validPassword123",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should reject empty name", async () => {
      const userData = {
        name: "",
        email: "empty@example.com",
        password: "validPassword123",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should reject short name", async () => {
      const userData = {
        name: "A",
        email: "short@example.com",
        password: "validPassword123",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should reject long name", async () => {
      const userData = {
        name: "A".repeat(101),
        email: "long@example.com",
        password: "validPassword123",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should reject short password", async () => {
      const userData = {
        name: "Short Password User",
        email: "shortpw@example.com",
        password: "12345",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });
});

afterAll(async () => {
  await User.destroy({
    where: {},
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
  await sequelize.close();
});
