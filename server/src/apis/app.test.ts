import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../app";

describe("App API Routes", () => {
  it("should return hello world", async () => {
    const response = await request(app).get("/api");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Hello World" });
  });
});
