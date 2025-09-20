import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/services/baseApi";
import { authReducer } from "@/features/auth/auth.slice";
import { movieReducer } from "@/features/movies/movie.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    movies: movieReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
