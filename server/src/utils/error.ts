import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger";
import { ZodError } from "zod";
import { ApiResponseStatus } from "../apis/app.type";
import { UniqueConstraintError, ValidationError } from "sequelize";
import { JsonWebTokenError } from "jsonwebtoken";
import { AxiosError } from "axios";
// Note: avoid importing from middleware to prevent circular dependencies

export interface ApiError extends Error {
  statusCode: number;
  message: string;
  details?: Record<string, any>;
}

export class AppError extends Error implements ApiError {
  public statusCode: number;
  public message: string;
  public details?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number,
    details?: Record<string, any>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.details = details;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 401, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 403, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 404, details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 429, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 500, details);
  }
}

export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.log(err, "<<< errHandler");
  logger.error(err);

  if (err instanceof ZodError) {
    res.status(400).json({
      statusCode: 400,
      status: ApiResponseStatus.ERROR,
      message: err.issues[0].message,
      details: err.issues.map((e) => ({
        path: e.path.join("."),
        message: e.message,
        code: e.code,
      })),
    });
  } else if (err instanceof UniqueConstraintError) {
    res.status(400).json({
      statusCode: 400,
      status: ApiResponseStatus.ERROR,
      message: err.message,
      details: {
        message: err.message,
      },
    });
  } else if (err instanceof ValidationError) {
    res.status(400).json({
      statusCode: 400,
      status: ApiResponseStatus.ERROR,
      message: err.message,
      details: {
        message: err.message,
      },
    });
  } else if (err instanceof AppError) {
    res.status(err.statusCode).json({
      statusCode: err.statusCode,
      status: ApiResponseStatus.ERROR,
      message: err.message,
      details: err.details,
    });
  } else if (err instanceof JsonWebTokenError) {
    res.status(401).json({
      statusCode: 401,
      status: ApiResponseStatus.ERROR,
      message: "Invalid token",
    });
  } else {
    console.log(err, "<<< errHandler");
    res.status(500).json({
      statusCode: 500,
      status: ApiResponseStatus.ERROR,
      message:
        "We're experiencing some technical difficulties. Please try again later.",
    });
  }
};

export const withErrorHandler = <T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<void>
) => {
  return async (req: T, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
