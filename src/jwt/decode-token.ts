import jwt, { type DecodeOptions } from "jsonwebtoken";
import type { JwtPayload } from "../types/jwt-payload";

export function decodeToken<TPayload extends object = JwtPayload>(
  token: string,
  options: DecodeOptions = {}
): TPayload | null {
  const decoded = jwt.decode(token, options);
  return decoded && typeof decoded === "object" ? (decoded as TPayload) : null;
}
