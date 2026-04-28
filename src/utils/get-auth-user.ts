import type { Request } from "express";
import { UnauthorizedError } from "../errors/unauthorized-error";
import type { AuthUser } from "../types/auth-user";

export function getAuthUser<TUser extends AuthUser = AuthUser>(req: Request): TUser {
  if (!req.user) {
    throw new UnauthorizedError("Authenticated user is not available");
  }

  return req.user as TUser;
}
