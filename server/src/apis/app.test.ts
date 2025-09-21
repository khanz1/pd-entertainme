import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../app";

describe("App API Routes", () => {
  it("should return welcome message with API info", async () => {
    const response = await request(app).get("/api");
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Welcome to Entertain Me API");
    expect(response.body.version).toBe("1.0.0");
    expect(response.body.endpoints.health).toBe("/api/health");
    expect(response.body.endpoints.documentation).toBe("/api/docs");
    expect(response.body.endpoints.authentication).toBe("/api/auth");
    expect(response.body.endpoints.movies).toBe("/api/movies");
    expect(response.body.endpoints.favorites).toBe("/api/favorites");
    expect(response.body.environment).toBeDefined();
    expect(response.body.documentation).toContain("/api/docs");
  });

  it("should redirect root path to API documentation", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/api/docs");
  });

  it("should serve swagger UI documentation", async () => {
    const response = await request(app).get("/api/docs/");
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
  });

  it("should return health status", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("healthy");
    expect(response.body.timestamp).toBeDefined();
    expect(response.body.uptime).toBeDefined();
    expect(response.body.environment).toBeDefined();
    expect(response.body.version).toBe("1.0.0");
    expect(typeof response.body.uptime).toBe("number");
  });
});
