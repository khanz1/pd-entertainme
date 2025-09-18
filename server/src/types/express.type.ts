import { User } from "../models";
import { Request } from "express";

export type AuthenticatedRequest = Request & {
  user?: User;
};