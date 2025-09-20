import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Base query with authentication headers
const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_SERVER_BASE_URL}/api`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQuery,
  tagTypes: ["Auth", "User", "Movie", "Recommendation", "Favorite"],
  endpoints: () => ({}),
});
