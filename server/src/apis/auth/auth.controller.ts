import { User } from "../../models";
import { RegisterSchema } from "./schema/register.schema";
import { Request, Response } from "express";
import { withErrorHandler, NotFoundError } from "../../utils/error";
import { ApiResponseStatus } from "../app.type";
import { LoginSchema, LoginWithGoogleSchema } from "./schema/login.schema";
import { UnauthorizedError } from "../../utils/error";
import { signToken } from "../../utils/crypto";
import { OAuth2Client } from "google-auth-library";
import { Env } from "../../config/env";
import { AuthenticatedRequest } from "../../types/express.type";

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

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: User Registration
 *     description: Create a new user account with email and password. Returns user information and JWT access token for immediate authentication.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             name: "John Doe"
 *             email: "john.doe@example.com"
 *             password: "SecurePass123!"
 *             profilePict: "https://example.com/avatar.jpg"
 *     responses:
 *       201:
 *         description: User successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 user:
 *                   id: 1
 *                   name: "John Doe"
 *                   email: "john.doe@example.com"
 *                   profilePict: "https://example.com/avatar.jpg"
 *                   createdAt: "2024-01-15T10:30:00Z"
 *                   updatedAt: "2024-01-15T10:30:00Z"
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation_error:
 *                 value:
 *                   statusCode: 400
 *                   status: "error"
 *                   message: "Email is required"
 *               email_exists:
 *                 value:
 *                   statusCode: 400
 *                   status: "error"
 *                   message: "Email already exists"
 */
export const register = withErrorHandler(
  async (req: Request, res: Response) => {
    const requestData = await RegisterSchema.parseAsync(req.body);
    const user = await User.create(requestData);
    const { password, ...newUser } = user.toJSON();
    res.status(201).json({
      status: ApiResponseStatus.SUCCESS,
      data: {
        user: newUser,
        accessToken: signToken({ id: newUser.id }),
      },
    });
  }
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User Login
 *     description: Authenticate user with email and password. Returns user information and JWT access token for API access.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "john.doe@example.com"
 *             password: "SecurePass123!"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 user:
 *                   id: 1
 *                   name: "John Doe"
 *                   email: "john.doe@example.com"
 *                   profilePict: "https://example.com/avatar.jpg"
 *                   createdAt: "2024-01-15T10:30:00Z"
 *                   updatedAt: "2024-01-15T10:30:00Z"
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 400
 *               status: "error"
 *               message: "Email is required"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 401
 *               status: "error"
 *               message: "Incorrect email or password"
 */
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

/**
 * @swagger
 * /api/auth/login/google:
 *   post:
 *     summary: Google OAuth Login
 *     description: Authenticate user using Google OAuth authorization code. Creates new account if user doesn't exist or logs in existing user.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleLoginRequest'
 *           example:
 *             code: "4/0AX4XfWh..."
 *     responses:
 *       200:
 *         description: Login successful (existing user)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 created: false
 *                 user:
 *                   id: 1
 *                   name: "John Doe"
 *                   email: "john.doe@gmail.com"
 *                   profilePict: "https://lh3.googleusercontent.com/..."
 *                   createdAt: "2024-01-15T10:30:00Z"
 *                   updatedAt: "2024-01-15T10:30:00Z"
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       201:
 *         description: Account created and login successful (new user)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               status: "success"
 *               data:
 *                 created: true
 *                 user:
 *                   id: 2
 *                   name: "Jane Smith"
 *                   email: "jane.smith@gmail.com"
 *                   profilePict: "https://lh3.googleusercontent.com/..."
 *                   createdAt: "2024-01-15T10:30:00Z"
 *                   updatedAt: "2024-01-15T10:30:00Z"
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Invalid authorization code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 400
 *               status: "error"
 *               message: "Code is required"
 *       401:
 *         description: Invalid Google ID token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 401
 *               status: "error"
 *               message: "Invalid Google ID token"
 */
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

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get Current User
 *     description: Retrieve the current authenticated user's profile information. Requires valid JWT token in Authorization header.
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *             example:
 *               status: "success"
 *               data:
 *                 user:
 *                   id: 1
 *                   name: "John Doe"
 *                   email: "john.doe@example.com"
 *                   profilePict: "https://example.com/avatar.jpg"
 *                   createdAt: "2024-01-15T10:30:00Z"
 *                   updatedAt: "2024-01-15T10:30:00Z"
 *       401:
 *         description: Authentication required or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 401
 *               status: "error"
 *               message: "Invalid token"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 404
 *               status: "error"
 *               message: "User not found"
 */
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
