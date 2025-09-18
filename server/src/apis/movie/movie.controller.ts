import {
  InternalServerError,
  NotFoundError,
  withErrorHandler,
} from "@utils/error";
import { tmdbAPI } from "../../utils/http";
import { GetMovieByIdSchema, GetMovieSchema } from "./schema/get-movie.schema";
import {
  ITMDBMovieDetail,
  TMDBNowPlayingMovie,
  type TMDBMovieResponse,
} from "./tmdb.type";
import { Movie, Recommendation } from "@models";
import { ApiResponseStatus } from "../app.type";
import { MovieError } from "./movie.type";
import { AxiosError } from "axios";
import { ErrorMessage } from "../../types/error.type";
import { AuthenticatedRequest } from "types/express.type";

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Get Movies
 *     description: Retrieve a paginated list of movies with optional filtering by category and search query. Data is fetched from TMDB API and formatted for consistent response.
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [popular, top_rated, upcoming, now_playing, search]
 *           default: popular
 *         description: Movie category type
 *         example: popular
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query (required when type=search)
 *         example: "fight club"
 *     responses:
 *       200:
 *         description: Movies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MoviesResponse'
 *             example:
 *               status: "success"
 *               totalPages: 500
 *               totalResults: 10000
 *               data:
 *                 - id: 550
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
 *               dates:
 *                 maximum: "2024-02-15"
 *                 minimum: "2024-01-01"
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 400
 *               status: "error"
 *               message: "Search query is required when type is search"
 */
export const getMovies = withErrorHandler(async (req, res) => {
  const { page, type, search } = await GetMovieSchema.parseAsync(req.query);
  let url = `/movie/${type}`;
  if (type === "search") {
    url = `/search/movie`;
  }

  const response = await tmdbAPI.get<TMDBMovieResponse>(url, {
    params: {
      page,
      query: search,
    },
  });

  const movies = response.data.results.map((result) => {
    return new Movie({
      id: result.id,
      tmdbId: result.id,
      title: result.title,
      overview: result.overview,
      releaseDate: new Date(result.release_date),
      posterPath: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
      backdropPath: `https://image.tmdb.org/t/p/w500${result.backdrop_path}`,
      voteAverage: result.vote_average,
      voteCount: result.vote_count,
      popularity: result.popularity,
      adult: result.adult,
      originalLanguage: result.original_language,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  res.json({
    ...(response.data && {
      dates: (response.data as TMDBNowPlayingMovie).dates,
    }),
    status: ApiResponseStatus.SUCCESS,
    totalPages: response.data.total_pages,
    totalResults: response.data.total_results,
    data: movies,
  });
});

/**
 * @swagger
 * /api/movies/{id}:
 *   get:
 *     summary: Get Movie Details
 *     description: Retrieve detailed information about a specific movie by TMDB ID, including cast, crew, production details, and ratings.
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: TMDB movie ID
 *         example: 550
 *     responses:
 *       200:
 *         description: Movie details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MovieDetailResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 id: 550
 *                 title: "Fight Club"
 *                 overview: "A ticking-time-bomb insomniac..."
 *                 releaseDate: "1999-10-15"
 *                 runtime: 139
 *                 budget: 63000000
 *                 revenue: 100853753
 *                 voteAverage: 8.4
 *                 voteCount: 26280
 *                 popularity: 61.416
 *                 adult: false
 *                 homepage: "https://www.foxmovies.com/movies/fight-club"
 *                 imdbId: "tt0137523"
 *                 originalLanguage: "en"
 *                 originalTitle: "Fight Club"
 *                 posterPath: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg"
 *                 backdropPath: "https://image.tmdb.org/t/p/original/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg"
 *                 status: "Released"
 *                 tagline: "Mischief. Mayhem. Soap."
 *                 genres:
 *                   - id: 18
 *                     name: "Drama"
 *                 productionCompanies:
 *                   - id: 508
 *                     name: "Regency Enterprises"
 *                     logoPath: "https://image.tmdb.org/t/p/original/7PzJdsLGlR7oW4J0J5Xcd0pHGRg.png"
 *                     originCountry: "US"
 *       404:
 *         description: Movie not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 404
 *               status: "error"
 *               message: "Movie not found"
 *       400:
 *         description: Invalid movie ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 400
 *               status: "error"
 *               message: "ID must be a number"
 */
export const getMovieById = withErrorHandler(async (req, res) => {
  const { id } = await GetMovieByIdSchema.parseAsync(req.params);
  try {
    const response = await tmdbAPI.get<ITMDBMovieDetail>(`/movie/${id}`);

    if (!response.data) {
      throw new NotFoundError(MovieError.MOVIE_NOT_FOUND);
    }

    const movie = response.data;
    const urlPath = `https://image.tmdb.org/t/p/w500`;
    const originalUrlPath = `https://image.tmdb.org/t/p/original`;
    res.json({
      status: ApiResponseStatus.SUCCESS,
      data: {
        adult: movie.adult,
        backdropPath: `${originalUrlPath}${movie.backdrop_path}`,
        belongsToCollection: {
          id: movie.belongs_to_collection?.id,
          name: movie.belongs_to_collection?.name,
          posterPath: `${urlPath}${movie.belongs_to_collection?.poster_path}`,
          backdrop_path: `${originalUrlPath}${movie.belongs_to_collection?.backdrop_path}`,
        },
        budget: movie.budget,
        genres: movie.genres,
        homepage: movie.homepage,
        id: movie.id,
        imdbId: movie.imdb_id,
        originCountry: movie.origin_country,
        originalLanguage: movie.original_language,
        originalTitle: movie.original_title,
        overview: movie.overview,
        popularity: movie.popularity,
        posterPath: `${urlPath}${movie.poster_path}`,
        productionCompanies: movie.production_companies.map(
          (productionCompany: any) => ({
            id: productionCompany.id,
            logoPath: `${originalUrlPath}${productionCompany.logo_path}`,
            name: productionCompany.name,
            originCountry: productionCompany.origin_country,
          })
        ),
        productionCountries: movie.production_countries,
        releaseDate: movie.release_date,
        revenue: movie.revenue,
        runtime: movie.runtime,
        spokenLanguages: movie.spoken_languages.map((spokenLanguage: any) => ({
          englishName: spokenLanguage.english_name,
          iso6391: spokenLanguage.iso_639_1,
          name: spokenLanguage.name,
        })),
        status: movie.status,
        tagline: movie.tagline,
        title: movie.title,
        video: movie.video,
        voteAverage: movie.vote_average,
        voteCount: movie.vote_count,
      },
    });
  } catch (err) {
    if (err instanceof AxiosError) {
      if (err.response?.status === 404) {
        throw new NotFoundError(MovieError.MOVIE_NOT_FOUND);
      } else {
        throw new InternalServerError(ErrorMessage.INTERNAL_SERVER_ERROR);
      }
    }
  }
});

/**
 * @swagger
 * /api/movies/recommendations:
 *   get:
 *     summary: Get AI Movie Recommendations
 *     description: Retrieve personalized movie recommendations generated by AI based on the user's favorite movies. Recommendations are processed in the background using OpenAI GPT-5 nano.
 *     tags: [Recommendations]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Recommendations retrieved successfully
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
 *                     $ref: '#/components/schemas/Recommendation'
 *             example:
 *               status: "success"
 *               data:
 *                 - id: 1
 *                   userId: 1
 *                   movieId: 278
 *                   movie:
 *                     id: 278
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
 *                   createdAt: "2024-01-15T10:30:00Z"
 *                   updatedAt: "2024-01-15T10:30:00Z"
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
 *       200:
 *         description: No recommendations available (empty array)
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
 *                   items: {}
 *             example:
 *               status: "success"
 *               data: []
 */
export const getRecommendations = withErrorHandler<AuthenticatedRequest>(
  async (req, res) => {
    const recommendations = await Recommendation.findAll({
      where: {
        userId: req.user!.id,
      },
      include: [
        {
          model: Movie,
          as: "movie",
        },
      ],
    });

    res.json({
      status: ApiResponseStatus.SUCCESS,
      data: recommendations,
    });
  }
);
