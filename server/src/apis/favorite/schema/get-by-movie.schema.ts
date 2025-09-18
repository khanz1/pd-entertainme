import { z } from "zod";

export const GetFavoriteByMovieSchema = z.object({
  tmdbId: z
    .string()
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val), {
      message: "TMDB ID must be a number",
    }),
});

export type GetFavoriteByMovieSchemaType = z.infer<
  typeof GetFavoriteByMovieSchema
>;
