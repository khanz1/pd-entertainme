import { z } from "zod";

export const DeleteFavoriteSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val), {
      error: "ID must be a number",
    }),
});
