import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import app from "../../app";
import { ApiResponseStatus } from "../app.type";
import sequelize from "../../config/database";
import { Favorite, User } from "../../models";
import { signToken } from "../../utils/crypto";
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
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(ApiResponseStatus.SUCCESS);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.movieId).toBeDefined();
      expect(response.body.data.userId).toBeDefined();
    });

    it("should return 400 when tmdbId is not provided", async () => {
      const response = await request(app)
        .post("/api/favorites")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});
      expect(response.status).toBe(400);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
    });

    it("should return 400 when tmdbId is not a number", async () => {
      const response = await request(app)
        .post("/api/favorites")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ tmdbId: "not a number" });
      expect(response.status).toBe(400);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
    });

    it("should return 400 when movie is already favorited", async () => {
      const movieId = 385687; // Movie that's already favorited in beforeAll
      const response = await request(app)
        .post("/api/favorites")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ tmdbId: movieId });
      expect(response.status).toBe(400);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
      expect(response.body.message).toBe("Already added to your favorite");
    });

    it("should return 401 for unauthenticated user", async () => {
      const response = await request(app)
        .post("/api/favorites")
        .send({ tmdbId: 550 });
      expect(response.status).toBe(401);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
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
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      // Check favorite structure
      const favorite = response.body.data[0];
      expect(favorite.id).toBeDefined();
      expect(favorite.userId).toBeDefined();
      expect(favorite.movieId).toBeDefined();
      expect(favorite.movie).toBeDefined();
    });

    it("should return 401 for unauthenticated user", async () => {
      const response = await request(app).get("/api/favorites");
      expect(response.status).toBe(401);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
    });
  });

  describe("GET /api/favorites/:id", () => {
    it("should return a specific favorite by ID", async () => {
      const response = await request(app)
        .get(`/api/favorites/${favoriteIdToDelete}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(ApiResponseStatus.SUCCESS);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(favoriteIdToDelete);
      expect(response.body.data.movie).toBeDefined();
      expect(response.body.data.user).toBeDefined();
    });

    it("should return 404 when favorite not found", async () => {
      const notFoundFavoriteId = 1_000_000;
      const response = await request(app)
        .get(`/api/favorites/${notFoundFavoriteId}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(404);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
      expect(response.body.message).toBe("Favorite not found");
    });

    it("should return 400 for invalid favorite ID", async () => {
      const response = await request(app)
        .get("/api/favorites/invalid")
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(400);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
    });

    it("should return 401 for unauthenticated user", async () => {
      const response = await request(app).get(
        `/api/favorites/${favoriteIdToDelete}`
      );
      expect(response.status).toBe(401);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
    });
  });

  describe("GET /api/favorites/movie/:tmdbId", () => {
    it("should return favorite for a specific movie by TMDB ID", async () => {
      const tmdbId = 385687; // Movie that's favorited in beforeAll
      const response = await request(app)
        .get(`/api/favorites/movie/${tmdbId}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(ApiResponseStatus.SUCCESS);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.movie.tmdbId).toBe(tmdbId);
      expect(response.body.data.userId).toBeDefined();
    });

    it("should return 404 when movie is not favorited", async () => {
      const tmdbId = 999999; // Non-favorited movie
      const response = await request(app)
        .get(`/api/favorites/movie/${tmdbId}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(404);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
      expect(response.body.message).toBe("Favorite not found for this movie");
    });

    it("should return 400 for invalid TMDB ID", async () => {
      const response = await request(app)
        .get("/api/favorites/movie/invalid")
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(400);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
    });

    it("should return 401 for unauthenticated user", async () => {
      const response = await request(app).get("/api/favorites/movie/385687");
      expect(response.status).toBe(401);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
    });
  });

  describe("DELETE /api/favorites/:id", () => {
    it("should delete a favorite", async () => {
      const response = await request(app)
        .delete(`/api/favorites/${favoriteIdToDelete}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(ApiResponseStatus.SUCCESS);
      expect(response.body.data).toBe(null);
    });

    it("should return 404 when favorite not found", async () => {
      const notFoundFavoriteId = 1_000_000;
      const response = await request(app)
        .delete(`/api/favorites/${notFoundFavoriteId}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(404);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
    });

    it("should return 403 when favorite is not owned by the user", async () => {
      const response = await request(app)
        .delete(`/api/favorites/${otherFavoriteIdToDelete}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(403);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
      expect(response.body.message).toBe(
        "You are not authorized to access this resource"
      );
    });

    it("should return 401 for unauthenticated user", async () => {
      const response = await request(app).delete(
        `/api/favorites/${favoriteIdToDelete}`
      );
      expect(response.status).toBe(401);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
    });
  });
});

afterAll(async () => {
  await sequelize.close();
});
