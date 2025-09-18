// Movie types and interfaces
export interface Movie {
  id: number;
  tmdbId: number;
  title: string;
  overview: string;
  releaseDate: string;
  posterPath: string;
  backdropPath: string;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  adult: boolean;
  originalLanguage: string;
  createdAt: string;
  updatedAt: string;
}

export interface MovieResponse {
  status: string;
  totalPages: number;
  totalResults: number;
  data: Movie[];
}

export interface Recommendation {
  id: number;
  userId: number;
  movieId: number;
  createdAt: string;
  updatedAt: string;
  movie: Movie;
}

export interface RecommendationResponse {
  status: string;
  data: Recommendation[];
}

export type MovieCategory =
  | "now_playing"
  | "top_rated"
  | "popular"
  | "upcoming"
  | "search";

export interface MovieFilters {
  page: number;
  type: MovieCategory;
  search?: string;
}

// Movie Detail Types
export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logoPath: string;
  name: string;
  originCountry: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  englishName: string;
  iso6391: string;
  name: string;
}

export interface BelongsToCollection {
  id: number;
  name: string;
  posterPath: string;
  backdrop_path: string;
}

export interface MovieDetail {
  isFavorite: boolean;
  adult: boolean;
  backdropPath: string;
  belongsToCollection: BelongsToCollection | null;
  budget: number;
  genres: Genre[];
  homepage: string;
  id: number;
  imdbId: string;
  originCountry: string[];
  originalLanguage: string;
  originalTitle: string;
  overview: string;
  popularity: number;
  posterPath: string;
  productionCompanies: ProductionCompany[];
  productionCountries: ProductionCountry[];
  releaseDate: string;
  revenue: number;
  runtime: number;
  spokenLanguages: SpokenLanguage[];
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  voteAverage: number;
  voteCount: number;
}

export interface MovieDetailResponse {
  status: string;
  data: MovieDetail;
}

// Favorite Types
export interface FavoriteMovie extends Movie {
  genres: Array<{
    id: number;
    name: string;
    MovieGenre: {
      id: number;
      movieId: number;
      genreId: number;
      createdAt: string;
      updatedAt: string;
    };
  }>;
}

export interface Favorite {
  id: number;
  userId: number;
  movieId: number;
  createdAt: string;
  updatedAt: string;
  movie: FavoriteMovie;
}

export interface FavoritesResponse {
  status: string;
  data: Favorite[];
}

export interface AddFavoriteRequest {
  tmdbId: number;
}

export interface AddFavoriteResponse {
  status: string;
  data: Favorite;
}
