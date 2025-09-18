import { Router } from "express";
import * as FavoriteController from "./favorite.controller";
import { authenticatation } from "../../middleware/authentication";
import { guardAuthor } from "../../middleware/guardAuthor";

const favoriteRouter = Router();

favoriteRouter.use(authenticatation);
favoriteRouter.post("/", FavoriteController.createFavorite);
favoriteRouter.get("/", FavoriteController.getFavorites);
favoriteRouter.get("/movie/:tmdbId", FavoriteController.getFavoriteByMovie);
favoriteRouter.get("/:id", FavoriteController.getFavoriteById);
favoriteRouter.delete("/:id", guardAuthor, FavoriteController.deleteFavorite);

export default favoriteRouter;
