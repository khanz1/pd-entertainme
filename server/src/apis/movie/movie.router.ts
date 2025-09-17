import { Router } from "express";
import * as MovieController from "./movie.controller";
import { authenticatation } from "@middleware/authentication";

const movieRouter = Router();

movieRouter.use(authenticatation);
movieRouter.get("/", MovieController.getMovies);
movieRouter.get("/recommendations", MovieController.getRecommendations);
movieRouter.get("/:id", MovieController.getMovieById);

export default movieRouter;
