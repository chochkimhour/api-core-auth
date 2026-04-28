import { createHash, timingSafeEqual } from "node:crypto";

export function hashOpaqueToken(token: string, pepper = ""): string {
  if (typeof token !== "string" || token.length === 0) {
    throw new TypeError("Opaque token must be a non-empty string");
  }

  return createHash("sha256").update(`${pepper}${token}`).digest("hex");
}

export function compareOpaqueToken(
  token: string,
  tokenHash: string,
  pepper = ""
): boolean {
  if (!token || !tokenHash) {
    return false;
  }

  const incomingHash = hashOpaqueToken(token, pepper);
  const incoming = Buffer.from(incomingHash, "hex");
  const stored = Buffer.from(tokenHash, "hex");

  if (incoming.length !== stored.length) {
    return false;
  }

  return timingSafeEqual(incoming, stored);
}
