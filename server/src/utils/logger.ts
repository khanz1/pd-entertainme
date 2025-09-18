import pino from "pino";
import { Env } from "../config/env";

const isProduction = Env.NODE_ENV === "production";
const isTest = Env.NODE_ENV === "test";

// Create base logger configuration
const baseConfig = {
  name: "entertainme-server",
  level: isProduction ? "info" : "debug",
  base: {
    pid: process.pid,
    hostname: undefined, // Remove hostname for cleaner logs
  },
};

// Configure transport for non-production environments
export const logger = pino(
  isProduction || isTest
    ? {
        ...baseConfig,
        // Production/Test: JSON logs for better machine parsing
        formatters: {
          level: (label) => {
            return { level: label };
          },
        },
      }
    : {
        ...baseConfig,
        // Development: Pretty logs for better human readability
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "yyyy-mm-dd HH:MM:ss",
            ignore: "pid,hostname",
            singleLine: false,
            hideObject: false,
            // messageFormat: "[{name}] {msg}",
          },
        },
      }
);
