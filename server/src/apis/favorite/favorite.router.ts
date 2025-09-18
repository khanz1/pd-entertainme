import { Router } from "express";
import * as FavoriteController from "./favorite.controller";
import { authenticatation } from "../../middleware/authentication";
import { guardAuthor } from "../../middleware/guardAuthor";

const favoriteRouter = Router();

favoriteRouter.post("/", authenticatation, FavoriteController.createFavorite);
favoriteRouter.get("/", authenticatation, FavoriteController.getFavorites);
favoriteRouter.delete(
  "/:id",
  authenticatation,
  guardAuthor,
  FavoriteController.deleteFavorite
);

export default favoriteRouter;
