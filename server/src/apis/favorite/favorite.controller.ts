import { Favorite, Genre, Movie, MovieGenre } from "../../models";
import { withErrorHandler } from "@utils/error";
import { ApiResponseStatus } from "../app.type";
import { CreateFavoriteSchema } from "./schema/create.schema";
import { type AuthenticatedRequest } from "../../types/express.type";
import { DeleteFavoriteSchema } from "./schema/delete.schema";
import * as MovieService from "../movie/movie.service";
import { UniqueConstraintError } from "sequelize";
import { BadRequestError } from "@utils/error";
import { movieRecommendationQueue } from "../movie/recommendation.queue";
import { QueueJobName } from "../../queue";
import { Env } from "../../config/env";

export enum FavoriteError {
  MOVIE_NOT_FOUND = "Movie not found in our database",
  FAVORITE_ALREADY_EXISTS = "Already added to your favorite",
}

export const createFavorite = withErrorHandler<AuthenticatedRequest>(
  async (req, res) => {
    const { tmdbId } = await CreateFavoriteSchema.parseAsync(req.body);

    let movie = await Movie.findOne({
      where: {
        tmdbId,
      },
    });

    if (!movie) {
      const movieData = await MovieService.getMovieFromTMDBById(tmdbId);

      const { createdMovie } = await MovieService.createMovieAndGenres(
        movieData
      );
      movie = createdMovie;
    }

    try {
      const createdFavorite = await Favorite.create({
        movieId: movie.id,
        userId: req.user!.id,
      });
      const favorite = await Favorite.findByPk(createdFavorite.id, {
        include: [
          {
            model: Movie,
            as: "movie",
            include: [
              {
                model: MovieGenre,
                as: "movieGenres",
              },
            ],
          },
        ],
      });

      if (Env.NODE_ENV !== "test") {
        await movieRecommendationQueue.add(QueueJobName.MOVIE_RECOMMENDATION, {
          userId: req.user!.id,
        });
      }

      res.json({
        status: ApiResponseStatus.SUCCESS,
        data: favorite,
      });
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        throw new BadRequestError(FavoriteError.FAVORITE_ALREADY_EXISTS);
      } else {
        throw err;
      }
    }
  }
);

export const getFavorites = withErrorHandler<AuthenticatedRequest>(
  async (req, res) => {
    const favorites = await Favorite.findAll({
      where: {
        userId: req.user!.id,
      },
      include: [
        {
          model: Movie,
          as: "movie",
          include: [
            {
              model: Genre,
              as: "genres",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    // await calculateRecommendations(req.user!.id);

    res.json({
      status: ApiResponseStatus.SUCCESS,
      data: favorites,
    });
  }
);

export const deleteFavorite = withErrorHandler<AuthenticatedRequest>(
  async (req, res) => {
    const { id } = await DeleteFavoriteSchema.parseAsync(req.params);

    await Favorite.destroy({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (Env.NODE_ENV !== "test") {
      await movieRecommendationQueue.add(QueueJobName.MOVIE_RECOMMENDATION, {
        userId: req.user!.id,
      });
    }

    res.json({
      status: ApiResponseStatus.SUCCESS,
      data: null,
    });
  }
);
