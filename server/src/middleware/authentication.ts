import { verifyToken } from "../utils/crypto";
import { UnauthorizedError, withErrorHandler } from "../utils/error";
import { User } from "../models";
import { AuthenticatedRequest } from "../types/express.type";

export enum AuthenticationError {
  INVALID_TOKEN = "Invalid token",
  UNAUTHORIZED = "Unauthorized",
}

export const AuthenticatedUser = new Map<number, User>();

export const authenticatation = withErrorHandler<AuthenticatedRequest>(
  async (req, res, next) => {
    const bearerToken = req.get("Authorization");
    if (!bearerToken) {
      throw new UnauthorizedError(AuthenticationError.INVALID_TOKEN);
    }
    const token = bearerToken?.split(" ")[1];
    if (!token) {
      throw new UnauthorizedError(AuthenticationError.INVALID_TOKEN);
    }
    const decoded = verifyToken<{ id: number }>(token);
    let user = AuthenticatedUser.get(decoded.id);
    if (!user) {
      const newUser = await User.findByPk(decoded.id);
      if (!newUser) {
        throw new UnauthorizedError(AuthenticationError.INVALID_TOKEN);
      }
      user = newUser;
      AuthenticatedUser.set(decoded.id, user);
    }
    req.user = user;
    next();
  }
);
