import type { AuthUser } from "../types/auth-user";
import type { JwtPayload } from "../types/jwt-payload";

export function defaultMapPayloadToUser(payload: unknown): AuthUser {
  const jwtPayload = payload as JwtPayload;

  if (jwtPayload.user && typeof jwtPayload.user === "object") {
    return jwtPayload.user;
  }

  return jwtPayload as AuthUser;
}
