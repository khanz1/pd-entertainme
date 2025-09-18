import { Favorite, Genre, Movie, MovieGenre, User } from "../../models";
import { withErrorHandler, NotFoundError } from "../../utils/error";
import { ApiResponseStatus } from "../app.type";
import { CreateFavoriteSchema } from "./schema/create.schema";
import { type AuthenticatedRequest } from "../../types/express.type";
import { DeleteFavoriteSchema } from "./schema/delete.schema";
import { GetFavoriteByIdSchema } from "./schema/get.schema";
import { GetFavoriteByMovieSchema } from "./schema/get-by-movie.schema";
import * as MovieService from "../movie/movie.service";
import { UniqueConstraintError } from "sequelize";
import { BadRequestError } from "../../utils/error";
import { movieRecommendationQueue } from "../movie/recommendation.queue";
import { QueueJobName } from "../../queue";
import { Env } from "../../config/env";
// import { GetFavoriteByIdSchema } from "./schema/get.schema";

export enum FavoriteError {
  MOVIE_NOT_FOUND = "Movie not found in our database",
  FAVORITE_ALREADY_EXISTS = "Already added to your favorite",
}

/**
 * @swagger
 * /api/favorites:
 *   post:
 *     summary: Add Movie to Favorites
 *     description: Add a movie to the user's favorites collection. If the movie doesn't exist in our database, it will be fetched from TMDB and stored. This action triggers AI recommendation generation in the background.
 *     tags: [Favorites]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFavoriteRequest'
 *           example:
 *             tmdbId: 550
 *     responses:
 *       200:
 *         description: Movie added to favorites successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Favorite'
 *             example:
 *               status: "success"
 *               data:
 *                 id: 1
 *                 userId: 1
 *                 movieId: 1
 *                 movie:
 *                   id: 1
 *                   tmdbId: 550
 *                   title: "Fight Club"
 *                   overview: "A ticking-time-bomb insomniac..."
 *                   releaseDate: "1999-10-15"
 *                   posterPath: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg"
 *                   backdropPath: "https://image.tmdb.org/t/p/w500/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg"
 *                   voteAverage: 8.4
 *                   voteCount: 26280
 *                   popularity: 61.416
 *                   adult: false
 *                   originalLanguage: "en"
 *                   createdAt: "2024-01-15T10:30:00Z"
 *                   updatedAt: "2024-01-15T10:30:00Z"
 *                   movieGenres:
 *                     - movieId: 1
 *                       genreId: 18
 *                 createdAt: "2024-01-15T10:30:00Z"
 *                 updatedAt: "2024-01-15T10:30:00Z"
 *       400:
 *         description: Validation error or movie already favorited
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation_error:
 *                 value:
 *                   statusCode: 400
 *                   status: "error"
 *                   message: "TMDB ID must be a valid number"
 *               already_favorited:
 *                 value:
 *                   statusCode: 400
 *                   status: "error"
 *                   message: "Already added to your favorite"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 401
 *               status: "error"
 *               message: "Invalid token"
 *       404:
 *         description: Movie not found in TMDB
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 404
 *               status: "error"
 *               message: "Movie not found in our database"
 */
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

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Get User's Favorite Movies
 *     description: Retrieve all movies that the authenticated user has added to their favorites collection, including complete movie details and genre information.
 *     tags: [Favorites]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Favorites retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Favorite'
 *             example:
 *               status: "success"
 *               data:
 *                 - id: 1
 *                   userId: 1
 *                   movieId: 1
 *                   movie:
 *                     id: 1
 *                     tmdbId: 550
 *                     title: "Fight Club"
 *                     overview: "A ticking-time-bomb insomniac..."
 *                     releaseDate: "1999-10-15"
 *                     posterPath: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg"
 *                     backdropPath: "https://image.tmdb.org/t/p/w500/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg"
 *                     voteAverage: 8.4
 *                     voteCount: 26280
 *                     popularity: 61.416
 *                     adult: false
 *                     originalLanguage: "en"
 *                     genres:
 *                       - id: 18
 *                         name: "Drama"
 *                   createdAt: "2024-01-15T10:30:00Z"
 *                   updatedAt: "2024-01-15T10:30:00Z"
 *                 - id: 2
 *                   userId: 1
 *                   movieId: 2
 *                   movie:
 *                     id: 2
 *                     tmdbId: 278
 *                     title: "The Shawshank Redemption"
 *                     overview: "Two imprisoned men bond over a number of years..."
 *                     releaseDate: "1994-09-23"
 *                     posterPath: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg"
 *                     voteAverage: 9.3
 *                     voteCount: 21828
 *                     popularity: 94.155
 *                     adult: false
 *                     originalLanguage: "en"
 *                     genres:
 *                       - id: 18
 *                         name: "Drama"
 *                   createdAt: "2024-01-15T11:00:00Z"
 *                   updatedAt: "2024-01-15T11:00:00Z"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 401
 *               status: "error"
 *               message: "Invalid token"
 */
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

    res.json({
      status: ApiResponseStatus.SUCCESS,
      data: favorites,
    });
  }
);

/**
 * @swagger
 * /api/favorites/{id}:
 *   get:
 *     summary: Get Favorite by ID
 *     description: Retrieve a specific favorite movie by its favorite record ID. Returns detailed information including movie data, genres, and user information.
 *     tags: [Favorites]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Favorite record ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Favorite retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/FavoriteDetail'
 *             example:
 *               status: "success"
 *               data:
 *                 id: 1
 *                 userId: 1
 *                 movieId: 1
 *                 movie:
 *                   id: 1
 *                   tmdbId: 550
 *                   title: "Fight Club"
 *                   overview: "A ticking-time-bomb insomniac..."
 *                   releaseDate: "1999-10-15"
 *                   posterPath: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg"
 *                   backdropPath: "https://image.tmdb.org/t/p/w500/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg"
 *                   voteAverage: 8.4
 *                   voteCount: 26280
 *                   popularity: 61.416
 *                   adult: false
 *                   originalLanguage: "en"
 *                 genres:
 *                   - id: 18
 *                     name: "Drama"
 *                 user:
 *                   id: 1
 *                   name: "John Doe"
 *                 createdAt: "2024-01-15T10:30:00Z"
 *                 updatedAt: "2024-01-15T10:30:00Z"
 *       400:
 *         description: Invalid favorite ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 400
 *               status: "error"
 *               message: "ID must be a number"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 401
 *               status: "error"
 *               message: "Invalid token"
 *       404:
 *         description: Favorite not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 404
 *               status: "error"
 *               message: "Favorite not found"
 */
export const getFavoriteById = withErrorHandler<AuthenticatedRequest>(
  async (req, res) => {
    const { id } = await GetFavoriteByIdSchema.parseAsync(req.params);
    const favorite = await Favorite.findByPk(id, {
      include: [
        {
          model: Movie,
          as: "movie",
          include: [
            {
              model: Genre,
              as: "genres",
              attributes: ["id", "name"],
              through: { attributes: [] }, // Exclude junction table attributes
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!favorite) {
      throw new NotFoundError("Favorite not found");
    }

    res.json({ status: ApiResponseStatus.SUCCESS, data: favorite });
  }
);

/**
 * @swagger
 * /api/favorites/movie/{tmdbId}:
 *   get:
 *     summary: Get Favorite by Movie TMDB ID
 *     description: Retrieve a user's favorite record for a specific movie using the TMDB movie ID. This is useful for checking if a movie is favorited and getting the favorite record details.
 *     tags: [Favorites]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tmdbId
 *         required: true
 *         schema:
 *           type: integer
 *         description: TMDB movie ID
 *         example: 550
 *     responses:
 *       200:
 *         description: Favorite found for the movie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/FavoriteDetail'
 *             example:
 *               status: "success"
 *               data:
 *                 id: 1
 *                 userId: 1
 *                 movieId: 1
 *                 movie:
 *                   id: 1
 *                   tmdbId: 550
 *                   title: "Fight Club"
 *                   overview: "A ticking-time-bomb insomniac..."
 *                   releaseDate: "1999-10-15"
 *                   posterPath: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg"
 *                   voteAverage: 8.4
 *                   voteCount: 26280
 *                 createdAt: "2024-01-15T10:30:00Z"
 *                 updatedAt: "2024-01-15T10:30:00Z"
 *       400:
 *         description: Invalid TMDB ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 400
 *               status: "error"
 *               message: "TMDB ID must be a number"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 401
 *               status: "error"
 *               message: "Invalid token"
 *       404:
 *         description: Movie not favorited by user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 404
 *               status: "error"
 *               message: "Favorite not found for this movie"
 */
export const getFavoriteByMovie = withErrorHandler<AuthenticatedRequest>(
  async (req, res) => {
    const { tmdbId } = await GetFavoriteByMovieSchema.parseAsync(req.params);

    const favorite = await Favorite.findOne({
      where: {
        userId: req.user!.id,
      },
      include: [
        {
          model: Movie,
          as: "movie",
          where: {
            tmdbId,
          },
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

    if (!favorite) {
      throw new NotFoundError("Favorite not found for this movie");
    }

    res.json({ status: ApiResponseStatus.SUCCESS, data: favorite });
  }
);

/**
 * @swagger
 * /api/favorites/{id}:
 *   delete:
 *     summary: Remove Movie from Favorites
 *     description: Remove a movie from the user's favorites collection. Only the owner can delete their own favorites. This action triggers AI recommendation update in the background.
 *     tags: [Favorites]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Favorite record ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Movie removed from favorites successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: "null"
 *                   example: null
 *             example:
 *               status: "success"
 *               data: null
 *       400:
 *         description: Invalid favorite ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 400
 *               status: "error"
 *               message: "ID must be a number"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 401
 *               status: "error"
 *               message: "Invalid token"
 *       403:
 *         description: Not authorized to delete this favorite
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 403
 *               status: "error"
 *               message: "You are not authorized to access this resource"
 *       404:
 *         description: Favorite not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 404
 *               status: "error"
 *               message: "Favorite not found"
 */
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
