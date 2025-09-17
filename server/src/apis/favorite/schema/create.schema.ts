import { z } from "zod";

export const CreateFavoriteSchema = z.object({
  tmdbId: z
    .union([z.string().transform((val) => parseInt(val, 10)), z.number()])
    .pipe(
      z.number({
        message: "TMDB ID must be a valid number",
      })
    ),
});

export type CreateFavoriteSchemaType = z.infer<typeof CreateFavoriteSchema>;
