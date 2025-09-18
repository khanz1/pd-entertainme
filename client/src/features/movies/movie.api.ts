import { baseApi } from "@/services/baseApi";
import type {
  MovieResponse,
  MovieFilters,
  RecommendationResponse,
  MovieDetailResponse,
  FavoritesResponse,
  AddFavoriteRequest,
  AddFavoriteResponse,
} from "./movie.type";

// Movie API endpoints
export const movieApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Movie endpoints
    getMovies: builder.query<MovieResponse, MovieFilters>({
      query: ({ page, type, search }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          type,
        });

        if (search) {
          params.append("search", search);
        }

        return `/movies?${params.toString()}`;
      },
      providesTags: ["Movie"],
      serializeQueryArgs: ({ queryArgs }) => {
        const { type, search } = queryArgs;
        return { type, search };
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        if (arg.type === "search") {
          return newItems;
        }
        return {
          ...newItems,
          data: [...currentCache.data, ...newItems.data],
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),

    getRecommendations: builder.query<RecommendationResponse, void>({
      query: () => "/movies/recommendations",
      providesTags: ["Recommendation"],
    }),

    getMovieDetail: builder.query<MovieDetailResponse, number>({
      query: (movieId) => `/movies/${movieId}`,
      providesTags: (_, __, movieId) => [{ type: "Movie", id: movieId }],
    }),

    // Favorites endpoints
    getFavorites: builder.query<FavoritesResponse, void>({
      query: () => "/favorites",
      providesTags: ["Favorite"],
    }),

    getFavoriteById: builder.query<{ status: string; data: any }, number>({
      query: (favoriteId) => `/favorites/${favoriteId}`,
      providesTags: (_, __, favoriteId) => [
        { type: "Favorite", id: favoriteId },
      ],
    }),

    getFavoriteByMovie: builder.query<{ status: string; data: any }, number>({
      query: (tmdbId) => `/favorites/movie/${tmdbId}`,
      providesTags: (_, __, tmdbId) => [
        { type: "Favorite", id: `movie-${tmdbId}` },
      ],
    }),

    addFavorite: builder.mutation<AddFavoriteResponse, AddFavoriteRequest>({
      query: (body) => ({
        url: "/favorites",
        method: "POST",
        body,
      }),
      invalidatesTags: (_, __, arg) => [
        "Favorite",
        "Movie",
        { type: "Favorite", id: `movie-${arg.tmdbId}` },
      ],
    }),

    removeFavorite: builder.mutation<{ status: string; data: null }, number>({
      query: (favoriteId) => ({
        url: `/favorites/${favoriteId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Favorite", "Movie"],
    }),
  }),
});

export const {
  useGetMoviesQuery,
  useGetRecommendationsQuery,
  useGetMovieDetailQuery,
  useGetFavoritesQuery,
  useGetFavoriteByIdQuery,
  useGetFavoriteByMovieQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = movieApi;
