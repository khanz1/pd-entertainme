import { describe, it, expect, afterAll, beforeAll } from "@jest/globals";
import request from "supertest";
import app from "../../app";
import { ApiResponseStatus } from "../app.type";
import { MovieError } from "./movie.type";
import { signToken } from "../../utils/crypto";
import { sequelize, User } from "../../models";

let accessToken: string;

beforeAll(async () => {
  const userSeed = {
    name: "Lelouch Lamperouge",
    email: "assistance.leloouch@gmail.com",
    password: "Admin123!",
    profilePict:
      "https://i.pinimg.com/736x/65/93/24/659324a53937e7e47e2ff13a99f5902f.jpg",
  };
  const user = await User.create(userSeed);
  accessToken = signToken({ id: user.id });
});

describe("Movie API", () => {
  describe("GET /api/movies", () => {
    it("should return a list of popular movies by default", async () => {
      const response = await request(app).get("/api/movies");
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(ApiResponseStatus.SUCCESS);
      expect(response.body.data).toBeDefined();
      expect(response.body.totalPages).toBeDefined();
      expect(response.body.totalResults).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should return movies with search query", async () => {
      const response = await request(app)
        .get("/api/movies")
        .query({ type: "search", search: "fight club" });
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(ApiResponseStatus.SUCCESS);
      expect(response.body.data).toBeDefined();
    });

    it("should return now playing movies with dates", async () => {
      const response = await request(app)
        .get("/api/movies")
        .query({ type: "now_playing" });
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(ApiResponseStatus.SUCCESS);
      expect(response.body.data).toBeDefined();
    });

    it("should return movies for different types", async () => {
      const types = ["popular", "top_rated", "upcoming"];
      for (const type of types) {
        const response = await request(app)
          .get("/api/movies")
          .query({ type, page: 1 });
        expect(response.status).toBe(200);
        expect(response.body.status).toBe(ApiResponseStatus.SUCCESS);
      }
    });

    it("should validate search query when type is search", async () => {
      const response = await request(app)
        .get("/api/movies")
        .query({ type: "search" });
      expect(response.status).toBe(400);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
    });
  });

  describe("GET /api/movies/:id", () => {
    it("should return movie details", async () => {
      const movieId = 1311031; // Demon Slayer: Kimetsu no Yaiba the Movie - Infinity Castle Arc
      const response = await request(app).get(`/api/movies/${movieId}`);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(ApiResponseStatus.SUCCESS);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(movieId);
      expect(response.body.data.title).toBeDefined();
      expect(response.body.data.overview).toBeDefined();
    });

    it("should return 404 when movie not found", async () => {
      const movieId = 1_000_000_000_000;
      const response = await request(app).get(`/api/movies/${movieId}`);
      expect(response.status).toBe(404);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
      expect(response.body.message).toBe(MovieError.MOVIE_NOT_FOUND);
    });

    it("should return 400 for invalid movie ID", async () => {
      const response = await request(app).get("/api/movies/invalid");
      expect(response.status).toBe(400);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
    });
  });

  describe("GET /api/movies/recommendations", () => {
    it("should return recommendations for authenticated user", async () => {
      const response = await request(app)
        .get("/api/movies/recommendations")
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(ApiResponseStatus.SUCCESS);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should return 401 for unauthenticated user", async () => {
      const response = await request(app).get("/api/movies/recommendations");
      expect(response.status).toBe(401);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
    });
  });
});

afterAll(async () => {
  await sequelize.truncate({ cascade: true, restartIdentity: true });
  await sequelize.close();
});
