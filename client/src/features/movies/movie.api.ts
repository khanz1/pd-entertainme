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

    addFavorite: builder.mutation<AddFavoriteResponse, AddFavoriteRequest>({
      query: (body) => ({
        url: "/favorites",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Favorite"],
    }),

    removeFavorite: builder.mutation<{ status: string; data: null }, number>({
      query: (favoriteId) => ({
        url: `/favorites/${favoriteId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Favorite"],
    }),
  }),
});

export const {
  useGetMoviesQuery,
  useGetRecommendationsQuery,
  useGetMovieDetailQuery,
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = movieApi;
