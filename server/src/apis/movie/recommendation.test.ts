import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import app from "../../app";
import { ApiResponseStatus } from "../app.type";
import { Favorite, Recommendation, User } from "@models";
import { signToken } from "@utils/crypto";
import { calculateRecommendations } from "./recommendation.service";
import * as MovieService from "./movie.service";

let accessToken: string;
let user: User;

beforeAll(async () => {
  const userSeed = {
    name: "Kakarotto",
    email: "assistance.kakarotto@gmail.com",
    password: "Admin123!",
    profilePict:
      "https://i.pinimg.com/736x/65/93/24/659324a53937e7e47e2ff13a99f5902f.jpg",
  };
  user = await User.create(userSeed);
  accessToken = signToken({ id: user.id });

  const tmdbId = [75656, 157336, 278];
  for (const id of tmdbId) {
    const movieData = await MovieService.getMovieFromTMDBById(id);

    const { createdMovie } = await MovieService.createMovieAndGenres(movieData);
    await Favorite.create({
      userId: user.id,
      movieId: createdMovie.id,
    });
  }
});

describe("Recommendation Service", () => {
  describe("GET /api/recommendations", () => {
    it("should return a list of recommendations", async () => {
      const recommendations = await calculateRecommendations(user.id);
      expect(recommendations).toBeDefined();
    }, 60_000);
  });
});
