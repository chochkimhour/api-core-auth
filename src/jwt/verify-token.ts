import jwt, { type Secret, type VerifyOptions } from "jsonwebtoken";
import { InvalidTokenError } from "../errors/invalid-token-error";
import { TokenExpiredAuthError } from "../errors/token-expired-auth-error";
import type { JwtPayload } from "../types/jwt-payload";
import { assertSecret } from "./assert-secret";

export function verifyToken<TPayload extends object = JwtPayload>(
  token: string,
  secret: Secret,
  options: VerifyOptions = {}
): TPayload {
  assertSecret(secret);

  try {
    return jwt.verify(token, secret, options) as TPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredAuthError();
    }

    throw new InvalidTokenError();
  }
}
