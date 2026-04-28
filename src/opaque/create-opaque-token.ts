import { generateOpaqueToken, type GenerateOpaqueTokenOptions } from "./generate-opaque-token";
import { hashOpaqueToken } from "./hash-opaque-token";

export interface OpaqueTokenPair {
  token: string;
  tokenHash: string;
}

export interface CreateOpaqueTokenOptions extends GenerateOpaqueTokenOptions {
  pepper?: string;
}

export function createOpaqueToken(options: CreateOpaqueTokenOptions = {}): OpaqueTokenPair {
  const token = generateOpaqueToken(options);

  return {
    token,
    tokenHash: hashOpaqueToken(token, options.pepper)
  };
}
