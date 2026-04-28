import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { assertSecret } from "./assert-secret";

export function generateToken(
  payload: string | Buffer | object,
  secret: Secret,
  options: SignOptions = {}
): string {
  assertSecret(secret);
  return jwt.sign(payload, secret, options);
}
