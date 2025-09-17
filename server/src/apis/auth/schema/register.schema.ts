import { z } from "zod";

export const RegisterSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .nonempty({ message: "Name is required" })
    .min(1, { message: "Name must be at least 1 character long" })
    .max(100, { message: "Name must be less than 100 characters long" })
    .trim(),
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
    .nonempty({ message: "Email is required" })
    .trim()
    .toLowerCase(),
  password: z
    .string({ error: "Password is required" })
    .nonempty({ message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters long" })
    .trim(),
  profilePict: z.string({ error: "Profile picture is required" }).optional(),
});

export type IRegisterSchema = z.infer<typeof RegisterSchema>;
