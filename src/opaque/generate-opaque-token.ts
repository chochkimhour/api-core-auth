import { randomBytes } from "node:crypto";

export interface GenerateOpaqueTokenOptions {
  byteLength?: number;
  encoding?: BufferEncoding;
}

export function generateOpaqueToken(options: GenerateOpaqueTokenOptions = {}): string {
  const { byteLength = 32, encoding = "base64url" } = options;

  if (!Number.isInteger(byteLength) || byteLength < 16) {
    throw new TypeError("Opaque token byte length must be an integer of at least 16");
  }

  return randomBytes(byteLength).toString(encoding);
}
