import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MovieCategory } from "./movie.type";

// Movie state interface
export interface MovieState {
  currentCategory: MovieCategory;
  searchQuery: string;
  currentPage: number;
  hasMoreMovies: boolean;
}

// Initial movie state
const initialState: MovieState = {
  currentCategory: "popular",
  searchQuery: "",
  currentPage: 1,
  hasMoreMovies: true,
};

// Movie slice
export const movieSlice = createSlice({
  name: "movies",
  initialState,
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

export const {
  setCurrentCategory,
  setSearchQuery,
  incrementPage,
  setHasMoreMovies,
  resetMovieState,
} = movieSlice.actions;

export const movieReducer = movieSlice.reducer;
