import type { Secret, SignOptions, VerifyOptions } from "jsonwebtoken";

export interface AuthConfig {
  secret: Secret;
  accessTokenExpiresIn?: SignOptions["expiresIn"];
  refreshTokenExpiresIn?: SignOptions["expiresIn"];
  issuer?: string;
  audience?: string | string[];
  signOptions?: Omit<SignOptions, "expiresIn" | "issuer" | "audience">;
  verifyOptions?: VerifyOptions;
}
