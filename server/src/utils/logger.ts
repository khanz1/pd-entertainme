import pino from "pino";
import { Env } from "../config/env";

const isProduction = Env.NODE_ENV === "production";
const isTest = Env.NODE_ENV === "test";

const baseConfig = {
  name: "server",
  level: isProduction ? "info" : "debug",
  base: {
    pid: process.pid,
    hostname: undefined,
  },
};

export const logger = pino(
  isProduction || isTest
    ? {
        ...baseConfig,
        formatters: {
          level: (label) => {
            return { level: label };
          },
        },
      }
    : {
        ...baseConfig,
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "yyyy-mm-dd HH:MM:ss",
            ignore: "pid,hostname",
            singleLine: false,
            hideObject: false,
          },
        },
      }
);
