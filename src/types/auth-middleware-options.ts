import type { Request } from "express";
import type { VerifyOptions } from "jsonwebtoken";
import type { AuthUser } from "./auth-user";

export interface AuthMiddlewareOptions {
  secret: string | Buffer;
  tokenExtractor?: (req: Request) => string | null;
  verifyOptions?: VerifyOptions;
  mapPayloadToUser?: (payload: unknown) => AuthUser;
}
