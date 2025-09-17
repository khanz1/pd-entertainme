import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import app from "../../app";
import { ApiResponseStatus } from "../app.type";
import sequelize from "../../config/database";
import { Favorite, User } from "../../models";
import { signToken } from "@utils/crypto";
import * as MovieService from "../movie/movie.service";

let accessToken: string;
let otherAccessToken: string;
let favoriteIdToDelete: number;
let otherFavoriteIdToDelete: number;
const userSeed = {
  name: "Oreki Hotarou",
  email: "assistance.oreki@gmail.com",
  password: "Admin123!",
  profilePict:
    "https://i.pinimg.com/736x/65/93/24/659324a53937e7e47e2ff13a99f5902f.jpg",
};

const otherUserSeed = {
  name: "Yukino Yukinoshita",
  email: "assistance.yukino@gmail.com",
  password: "Admin123!",
  profilePict:
    "https://i.pinimg.com/736x/65/93/24/659324a53937e7e47e2ff13a99f5902f.jpg",
};

beforeAll(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    const user = await User.create(userSeed);
    const otherUser = await User.create(otherUserSeed);
    const tmdbId = 385687;
    const movieData = await MovieService.getMovieFromTMDBById(tmdbId);

    const { createdMovie } = await MovieService.createMovieAndGenres(movieData);
    const favorite = await Favorite.create({
      userId: user.id,
      movieId: createdMovie.id,
    });
    const otherFavorite = await Favorite.create({
      userId: otherUser.id,
      movieId: createdMovie.id,
    });
    otherFavoriteIdToDelete = otherFavorite.id;
    favoriteIdToDelete = favorite.id;
    accessToken = signToken({ id: user.id });
    otherAccessToken = signToken({ id: otherUser.id });
  } catch (err) {
    console.error(err, "<<< err beforeAll");
    throw err;
  }
});

describe("Favorite API", () => {
  describe("POST /api/favorites", () => {
    it("should create a favorite movie", async () => {
      const movieId = 1311031; // Demon Slayer: Kimetsu no Yaiba the Movie - Infinity Castle Arc
      const response = await request(app)
        .post("/api/favorites")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          tmdbId: movieId,
        });
      console.log(response.body, "<<< response.body");
      // expect(response.status).toBe(200);
      // expect(response.body.status).toBe(ApiResponseStatus.SUCCESS);
      expect(response.body.data).toBeDefined();
    });

    it("should return a 400 Bad Request when tmdbId is not provided", async () => {
      const response = await request(app)
        .post("/api/favorites")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});
      expect(response.status).toBe(400);
    });

    it("should return a 400 Bad Request when tmdbId is not a number", async () => {
      const response = await request(app)
        .post("/api/favorites")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ tmdbId: "not a number" });
    });
  });

  describe("GET /api/favorites", () => {
    it("should return a list of favorites", async () => {
      const response = await request(app)
        .get("/api/favorites")
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(ApiResponseStatus.SUCCESS);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("DELETE /api/favorites/:id", () => {
    it("should delete a favorite", async () => {
      const response = await request(app)
        .delete(`/api/favorites/${favoriteIdToDelete}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(200);
    });

    it("should return a 404 when favorite not found", async () => {
      const notFoundFavoriteId = 1_000_000;
      const response = await request(app)
        .delete(`/api/favorites/${notFoundFavoriteId}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(404);
    });

    it("should return a 403 when favorite is not owned by the user", async () => {
      const response = await request(app)
        .delete(`/api/favorites/${otherFavoriteIdToDelete}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(403);
    });
  });
});

afterAll(async () => {
  await sequelize.close();
});
