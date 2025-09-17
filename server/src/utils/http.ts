import axios from "axios";
import { Env } from "../config/env";

export const tmdbAPI = axios.create({
  baseURL: Env.TMDB_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${Env.TMDB_API_KEY}`,
  },
});
