import { Router } from "express";
import * as AppController from "./app.controller";
import AuthRouter from "./auth/auth.router";
import MovieRouter from "./movie/movie.router";
import FavoriteRouter from "./favorite/favorite.router";

const appRouter = Router();

appRouter.get("/health", AppController.getHealth);
appRouter.use("/auth", AuthRouter);
appRouter.use("/movies", MovieRouter);
appRouter.use("/favorites", FavoriteRouter);

export default appRouter;
