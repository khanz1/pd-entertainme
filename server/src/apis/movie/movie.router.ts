import { Router } from "express";
import * as MovieController from "./movie.controller";
import {
  authenticatation,
  optionalAuthentication,
} from "../../middleware/authentication";

const movieRouter = Router();

movieRouter.get("/", MovieController.getMovies);
movieRouter.get(
  "/recommendations",
  authenticatation,
  MovieController.getRecommendations
);
movieRouter.get("/:id", optionalAuthentication, MovieController.getMovieById);

export default movieRouter;
