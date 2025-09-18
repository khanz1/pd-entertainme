import { tmdbAPI } from "../../utils/http";
import { TMDBBasicMovie, type ITMDBMovieDetail } from "../movie/tmdb.type";
import { Genre, Movie, MovieGenre } from "../../models";

export const getMovieFromTMDBById = async (tmdbId: number) => {
  const movieResponse = await tmdbAPI.get<ITMDBMovieDetail>(`/movie/${tmdbId}`);
  return movieResponse.data;
};

export const searchMovieFromTMDB = async (query: string) => {
  const movieResponse = await tmdbAPI.get<TMDBBasicMovie>(`/search/movie`, {
    params: {
      query,
    },
  });

  return movieResponse.data;
};

export const createMovieAndGenres = async (movieData: ITMDBMovieDetail) => {
  const genres = [];
  for (const genre of movieData.genres) {
    const [createdGenre] = await Genre.findOrCreate({
      where: {
        tmdbId: genre.id,
      },
      defaults: {
        tmdbId: genre.id,
        name: genre.name,
      },
    });

    genres.push(createdGenre);
  }

  const [createdMovie] = await Movie.findOrCreate({
    where: {
      tmdbId: movieData.id,
    },
    defaults: {
      tmdbId: movieData.id,
      title: movieData.title,
      overview: movieData.overview,
      releaseDate: new Date(movieData.release_date),
      posterPath: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
      backdropPath: `https://image.tmdb.org/t/p/w500${movieData.backdrop_path}`,
      voteAverage: movieData.vote_average,
      voteCount: movieData.vote_count,
      popularity: movieData.popularity,
      adult: movieData.adult,
      originalLanguage: movieData.original_language,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const movieGenres = await Genre.findAll({
    where: {
      tmdbId: movieData.genres.map((genre) => genre.id),
    },
  });

  for (const genre of movieGenres) {
    await MovieGenre.findOrCreate({
      where: {
        movieId: createdMovie.id,
        genreId: genre.id,
      },
      defaults: {
        movieId: createdMovie.id,
        genreId: genre.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  // const mappedMovieGenres = movieGenres.map((genre) => ({
  //   movieId: createdMovie.id,
  //   genreId: genre.id,
  //   createdAt: new Date(),
  //   updatedAt: new Date(),
  // }));

  // await MovieGenre.bulkCreate(mappedMovieGenres);

  return { createdMovie, createdGenres: genres };
};
