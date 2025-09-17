import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .email({
      error: (error) => {
        if (!error.input || error.input === "") {
          return {
            message: "Email is required",
          };
        }

        return {
          message: "Invalid email format",
        };
      },
    })
    .trim()
    .toLowerCase(),
  password: z
    .string({ error: "Password is required" })
    .nonempty({ message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters long" })
    .trim(),
});

export type ILoginSchema = z.infer<typeof LoginSchema>;


// export const LoginWithGoogleSchema = z.object({
//   googleIdToken: z.string({ error: "Google ID token is required" }),
// });

// export type ILoginWithGoogleSchema = z.infer<typeof LoginWithGoogleSchema>;

export const LoginWithGoogleSchema = z.object({
  code: z.string({ error: "Code is required" }),
});

export type ILoginWithGoogleSchema = z.infer<typeof LoginWithGoogleSchema>;