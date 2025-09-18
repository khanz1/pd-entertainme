import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../app";

describe("App API Routes", () => {
  it("should return hello world", async () => {
    const response = await request(app).get("/api");
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Welcome to Entertain Me API");
    expect(response.body.version).toBe("1.0.0");
    expect(response.body.endpoints.health).toBe("/api/health");
  });
});
