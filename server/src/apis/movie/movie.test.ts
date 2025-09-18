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
    it("should return a list of movies", async () => {
      const response = await request(app)
        .get("/api/movies")
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(ApiResponseStatus.SUCCESS);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/movies/:id", () => {
    it("should return a movie", async () => {
      const movieId = 1311031; // Demon Slayer: Kimetsu no Yaiba the Movie - Infinity Castle Arc
      const response = await request(app)
        .get(`/api/movies/${movieId}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(ApiResponseStatus.SUCCESS);
      expect(response.body.data).toBeDefined();
    });

    it("should return a 404 when movie not found", async () => {
      const movieId = 1_000_000_000_000;
      const response = await request(app)
        .get(`/api/movies/${movieId}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(404);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
      expect(response.body.message).toBe(MovieError.MOVIE_NOT_FOUND);
    });
  });
});

afterAll(async () => {
  await sequelize.truncate({ cascade: true, restartIdentity: true });
  await sequelize.close();
});