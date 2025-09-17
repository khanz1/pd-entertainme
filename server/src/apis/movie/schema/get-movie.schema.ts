import { z } from "zod";

export const GetMovieSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val))
    .default(1),
  type: z
    .enum(["popular", "top_rated", "upcoming", "now_playing", "search"])
    .default("popular"),
  search: z.string().optional(),
});

export const GetMovieByIdSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val), {
      error: "ID must be a number",
    }),
});
