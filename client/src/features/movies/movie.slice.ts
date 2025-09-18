import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "./movie.api";
import type { MovieCategory } from "./movie.type";

// Auth state interface
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

// Movie state interface
export interface MovieState {
  currentCategory: MovieCategory;
  searchQuery: string;
  currentPage: number;
  hasMoreMovies: boolean;
}

// Combined state interface
export interface AppState {
  auth: AuthState;
  movies: MovieState;
}

// Initial auth state
const initialAuthState: AuthState = {
  user: null,
  accessToken: localStorage.getItem("accessToken"),
  isAuthenticated: !!localStorage.getItem("accessToken"),
};

// Initial movie state
const initialMovieState: MovieState = {
  currentCategory: "popular",
  searchQuery: "",
  currentPage: 1,
  hasMoreMovies: true,
};

// Auth slice
export const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;

      // Store token in localStorage
      localStorage.setItem("accessToken", accessToken);
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;

      // Remove token from localStorage
      localStorage.removeItem("accessToken");
    },

    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },

    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
      state.accessToken = action.payload
        ? localStorage.getItem("accessToken")
        : null;
    },
  },
});

// Movie slice
export const movieSlice = createSlice({
  name: "movies",
  initialState: initialMovieState,
  reducers: {
    setCurrentCategory: (state, action: PayloadAction<MovieCategory>) => {
      state.currentCategory = action.payload;
      state.currentPage = 1;
      state.hasMoreMovies = true;
      if (action.payload !== "search") {
        state.searchQuery = "";
      }
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentCategory = "search";
      state.currentPage = 1;
      state.hasMoreMovies = true;
    },

    incrementPage: (state) => {
      state.currentPage += 1;
    },

    setHasMoreMovies: (state, action: PayloadAction<boolean>) => {
      state.hasMoreMovies = action.payload;
    },

    resetMovieState: (state) => {
      state.currentCategory = "popular";
      state.searchQuery = "";
      state.currentPage = 1;
      state.hasMoreMovies = true;
    },
  },
});

export const { setCredentials, logout, clearAuth, setIsAuthenticated } =
  authSlice.actions;

export const {
  setCurrentCategory,
  setSearchQuery,
  incrementPage,
  setHasMoreMovies,
  resetMovieState,
} = movieSlice.actions;

export const authReducer = authSlice.reducer;
export const movieReducer = movieSlice.reducer;
