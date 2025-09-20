import { baseApi } from "@/services/baseApi";
import type {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  GoogleLoginRequest,
  UserMeResponse,
} from "./auth.type";

// Auth API endpoints
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Authentication endpoints
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

    googleLogin: builder.mutation<AuthResponse, GoogleLoginRequest>({
      query: (credentials) => ({
        url: "/auth/login/google",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    // Removed refresh token endpoint - no longer supported

    // User endpoints
    getUserMe: builder.query<UserMeResponse, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGoogleLoginMutation,
  useGetUserMeQuery,
} = authApi;
