import { UnauthorizedError } from "../errors/unauthorized-error";

export function assertSecret(secret: unknown): asserts secret is string | Buffer {
  if (
    secret === undefined ||
    secret === null ||
    (typeof secret === "string" && secret.trim().length === 0)
  ) {
    throw new UnauthorizedError("JWT secret is required");
  }
}
