import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Base query with authentication headers and 401 handling
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_SERVER_BASE_URL}/api`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Enhanced base query with 401 error handling
const baseQuery = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQueryWithAuth(args, api, extraOptions);
  
  // Handle 401 Unauthorized responses
  if (result.error && result.error.status === 401) {
    // Remove access token from localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("wasAuthenticated");
    
    // Reload the website to reset the application state
    window.location.reload();
  }
  
  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQuery,
  tagTypes: ["Auth", "User", "Movie", "Recommendation", "Favorite"],
  endpoints: () => ({}),
});
