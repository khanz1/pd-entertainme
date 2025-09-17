import * as jwt from "jsonwebtoken";
import { Env } from "../config/env";
import bcrypt from "bcryptjs";

export const signToken = (payload: Record<string, any>) => {
  return jwt.sign(payload, Env.JWT_SECRET, {
    expiresIn: Env.JWT_EXPIRES_IN,
  });
};

export const verifyToken = <T>(token: string) => {
  return jwt.verify(token, Env.JWT_SECRET) as T;
};

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};
