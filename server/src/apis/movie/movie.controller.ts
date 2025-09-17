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
