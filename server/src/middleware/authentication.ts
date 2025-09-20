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
    console.log(`1 >> ${bearerToken}`);
    if (!bearerToken) {
      throw new UnauthorizedError(AuthenticationError.INVALID_TOKEN);
    }
    const token = bearerToken?.split(" ")[1];
    console.log(`2 >> ${token}`);
    if (!token) {
      throw new UnauthorizedError(AuthenticationError.INVALID_TOKEN);
    }
    const decoded = verifyToken<{ id: number }>(token);
    console.log(`3 >>`, decoded);
    let user = AuthenticatedUser.get(decoded.id);
    console.log(`4 >>`, user);
    const s = await User.findAll();
    console.log(`5 >>`, s);
    if (!user) {
      const newUser = await User.findByPk(decoded.id);
      console.log(`6 >>`, newUser);
      if (!newUser) {
        throw new UnauthorizedError(AuthenticationError.INVALID_TOKEN);
      }
      user = newUser;
      AuthenticatedUser.set(decoded.id, user);
    }
    req.user = user;
    console.log(`7 >>`, req.user);
    next();
  }
);

export const optionalAuthentication = withErrorHandler<AuthenticatedRequest>(
  async (req, res, next) => {
    const bearerToken = req.get("Authorization");
    if (!bearerToken) {
      return next();
    }
    const token = bearerToken?.split(" ")[1];
    if (!token) {
      return next();
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