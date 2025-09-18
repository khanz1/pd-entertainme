import { Router } from "express";
import * as MovieController from "./movie.controller";
import { authenticatation } from "../../middleware/authentication";

const movieRouter = Router();

movieRouter.get("/", MovieController.getMovies);
movieRouter.get("/:id", MovieController.getMovieById);
movieRouter.use(authenticatation);
movieRouter.get("/recommendations", MovieController.getRecommendations);

export default movieRouter;
