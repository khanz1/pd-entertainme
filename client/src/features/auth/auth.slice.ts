import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User, AuthState } from "./auth.type";

// Initial auth state
const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem("accessToken"),
  isAuthenticated: !!localStorage.getItem("accessToken"),
};

// Auth slice
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
      }>
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
      localStorage.removeItem("wasAuthenticated");
    },

    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("wasAuthenticated");
    },

    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
      if (action.payload) {
        state.accessToken = localStorage.getItem("accessToken");
      } else {
        state.accessToken = null;
      }
    },
  },
});

export const { setCredentials, logout, clearAuth, setIsAuthenticated } =
  authSlice.actions;

export const authReducer = authSlice.reducer;
