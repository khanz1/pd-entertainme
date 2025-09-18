import { z } from "zod";
import type { SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";

const envType = {
  production: ".env.production",
  test: ".env.test",
  development: ".env.development",
};

const envPath = path.resolve(
  __dirname,
  "..",
  "..",
  envType[process.env.NODE_ENV as keyof typeof envType]
);

dotenv.config({
  path: envPath,
});

const EnvSchema = z.object({
  PORT: z
    .string({ error: "PORT is required" })
    .transform((val) => parseInt(val))
    .default(3000),
  NODE_ENV: z
    .enum(["development", "test", "production"], {
      error: "NODE_ENV is required",
    })
    .default("development"),
  DATABASE_URL: z
    .string({ error: "DATABASE_URL is required" })
    .default(
      "postgresql://postgres:postgres@localhost:5432/pd_entertainme_db_test"
    ),
  JWT_SECRET: z.string({ error: "JWT_SECRET is required" }).default("secret"),
  JWT_EXPIRES_IN: z
    .string({ error: "JWT_EXPIRES_IN is required" })
    .default("7d"),

  GOOGLE_CLIENT_ID: z
    .string({ error: "GOOGLE_CLIENT_ID is required" })
    .default(""),
  GOOGLE_CLIENT_SECRET: z
    .string({ error: "GOOGLE_CLIENT_SECRET is required" })
    .default(""),
  GOOGLE_REDIRECT_URI: z
    .string({ error: "GOOGLE_REDIRECT_URI is required" })
    .default(""),
  TMDB_API_KEY: z.string({ error: "TMDB_API_KEY is required" }).default(""),
  TMDB_BASE_URL: z.string({ error: "TMDB_BASE_URL is required" }).default(""),

  REDIS_URL: z.string({ error: "REDIS_URL is required" }).default(""),
  DOCS_CONTACT_NAME: z
    .string({ error: "DOCS_CONTACT_NAME is required" })
    .default(""),
  DOCS_CONTACT_EMAIL: z
    .string({ error: "DOCS_CONTACT_EMAIL is required" })
    .default(""),
  DOCS_CONTACT_WEB: z
    .string({ error: "DOCS_CONTACT_URL is required" })
    .default(""),
  DOCS_SERVER_URL: z
    .string({ error: "DOCS_SERVER_URL is required" })
    .default(""),
});

export type IEnv = z.infer<typeof EnvSchema> & {
  JWT_EXPIRES_IN: SignOptions["expiresIn"];
};

export const Env = EnvSchema.parse(process.env) as IEnv;
