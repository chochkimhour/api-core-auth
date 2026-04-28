import type { Secret, SignOptions } from "jsonwebtoken";
import type { AuthUser } from "../types/auth-user";
import { generateToken } from "./generate-token";

export function generateRefreshToken(
  user: AuthUser | object,
  secret: Secret,
  options: SignOptions = {}
): string {
  return generateToken(user, secret, {
    expiresIn: "7d",
    ...options
  });
}
