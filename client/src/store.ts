import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/services/baseApi";
import { authReducer, movieReducer } from "@/features/movies/movie.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    movies: movieReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
