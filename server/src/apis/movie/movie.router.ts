import { Router } from "express";
import * as MovieController from "./movie.controller";
import { authenticatation } from "../../middleware/authentication";

const movieRouter = Router();

movieRouter.get("/", MovieController.getMovies);
movieRouter.get(
  "/recommendations",
  authenticatation,
  MovieController.getRecommendations
);
movieRouter.get("/:id", authenticatation, MovieController.getMovieById);

export default movieRouter;
