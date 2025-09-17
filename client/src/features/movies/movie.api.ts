import { baseApi } from "@/services/baseApi";
import type {
  MovieResponse,
  MovieFilters,
  RecommendationResponse,
  MovieDetailResponse,
  FavoritesResponse,
  AddFavoriteRequest,
  AddFavoriteResponse,
  UserMeResponse,
} from "./movie.type";

// Auth types
export interface User {
  id: number;
  name: string;
  email: string;
  profilePict: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  status: string;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  profilePict: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Movie API endpoints
export const movieApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Auth endpoints
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

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

    // Auth endpoints
    getUserMe: builder.query<UserMeResponse, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
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
  useRegisterMutation,
  useLoginMutation,
  useGetMoviesQuery,
  useGetRecommendationsQuery,
  useGetMovieDetailQuery,
  useGetUserMeQuery,
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = movieApi;
