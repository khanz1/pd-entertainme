import { User } from "@models";
import { RegisterSchema } from "./schema/register.schema";
import { Request, Response } from "express";
import { withErrorHandler, NotFoundError } from "../../utils/error";
import { ApiResponseStatus } from "../app.type";
import { LoginSchema, LoginWithGoogleSchema } from "./schema/login.schema";
import { UnauthorizedError } from "../../utils/error";
import { signToken } from "../../utils/crypto";
import { OAuth2Client } from "google-auth-library";
import { Env } from "../../config/env";
import { AuthenticatedRequest } from "types/express.type";
import axios from "axios";

// const client = new OAuth2Client();

console.log(
  {
    GOOGLE_CLIENT_ID: Env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: Env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: Env.GOOGLE_REDIRECT_URI,
  },
  "<<<< auth.controller.ts"
);
const client = new OAuth2Client(
  Env.GOOGLE_CLIENT_ID,
  Env.GOOGLE_CLIENT_SECRET,
  Env.GOOGLE_REDIRECT_URI
);

export enum AuthError {
  INCORRECT_EMAIL_OR_PASSWORD = "Incorrect email or password",
  INVALID_GOOGLE_ID_TOKEN = "Invalid Google ID token",
  USER_NOT_FOUND = "User not found",
}

export const register = withErrorHandler(
  async (req: Request, res: Response) => {
    const requestData = await RegisterSchema.parseAsync(req.body);
    const { password, ...newUser } = await User.create(requestData);
    res.status(201).json({
      status: ApiResponseStatus.SUCCESS,
      data: {
        user: newUser,
        accessToken: signToken({ id: newUser.id }),
      },
    });
  }
);

export const login = withErrorHandler(async (req: Request, res: Response) => {
  const requestData = await LoginSchema.parseAsync(req.body);
  const { email, password } = requestData;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new UnauthorizedError(AuthError.INCORRECT_EMAIL_OR_PASSWORD);
  }

  const isPasswordCorrect = await user.validatePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthorizedError(AuthError.INCORRECT_EMAIL_OR_PASSWORD);
  }
  const { password: _, ...userData } = user.toJSON();
  res.status(200).json({
    status: ApiResponseStatus.SUCCESS,
    data: {
      user: userData,
      accessToken: signToken({ id: user.id }),
    },
  });
});

export const loginWithGoogle = withErrorHandler(
  async (req: Request, res: Response) => {
    // const requestData = await LoginWithGoogleSchema.parseAsync(req.body);

    // const ticket = await client.verifyIdToken({
    //   idToken: requestData.googleIdToken,
    //   audience: Env.GOOGLE_CLIENT_ID,
    // });

    // const payload = ticket.getPayload();

    // if (!payload) {
    //   throw new UnauthorizedError(AuthError.INVALID_GOOGLE_ID_TOKEN);
    // }

    // const [user, created] = await User.findOrCreate({
    //   where: { email: payload?.email },
    //   defaults: {
    //     name: payload.name || "",
    //     email: payload.email || "",
    //     password: Math.random().toString(36).substring(2, 15),
    //     profilePict: payload.picture || "",
    //   },
    // });

    // res.status(created ? 201 : 200).json({
    //   status: ApiResponseStatus.SUCCESS,
    //   data: {
    //     created,
    //     user: user.toJSON(),
    //     accessToken: signToken({ id: user.id }),
    //   },
    // });

    const { code } = await LoginWithGoogleSchema.parseAsync(req.body);
    console.log(code, "<<< loginWithGoogle.code");

    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    console.log(tokens, "<<< loginWithGoogle.tokens");

    // Optional: Verify ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token || "",
      audience: Env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log(payload, "<<< loginWithGoogle.payload");

    if (!payload) {
      throw new UnauthorizedError(AuthError.INVALID_GOOGLE_ID_TOKEN);
    }

    const [user, created] = await User.findOrCreate({
      where: { email: payload?.email },
      defaults: {
        name: payload.name || "",
        email: payload.email || "",
        password: Math.random().toString(36).substring(2, 15),
        profilePict: payload.picture || "",
      },
    });

    res.status(created ? 201 : 200).json({
      status: ApiResponseStatus.SUCCESS,
      data: {
        created,
        user: user.toJSON(),
        accessToken: signToken({ id: user.id }),
      },
    });
  }
);

export const getMe = withErrorHandler<AuthenticatedRequest>(
  async (req, res) => {
    const user = await User.findByPk(req.user!.id);
    if (!user) {
      throw new NotFoundError(AuthError.USER_NOT_FOUND);
    }
    const { password: _, ...userData } = user.toJSON();
    res.status(200).json({
      status: ApiResponseStatus.SUCCESS,
      data: {
        user: userData,
      },
    });
  }
);
