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

export const getMovieById = withErrorHandler(async (req, res) => {
  const { id } = await GetMovieByIdSchema.parseAsync(req.params);
  try {
    const response = await tmdbAPI.get<ITMDBMovieDetail>(`/movie/${id}`);

    if (!response.data) {
      throw new NotFoundError(MovieError.MOVIE_NOT_FOUND);
    }
    res.json({
      status: ApiResponseStatus.SUCCESS,
      data: response.data,
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
