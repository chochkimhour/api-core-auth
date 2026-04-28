import type { Request } from "express";
import type { AuthUser } from "./auth-user";

export interface AuthMiddlewareOptions {
  tokenExtractor?: (req: Request) => string | null;
  verifyToken: (token: string, req: Request) => AuthUser | null | false | Promise<AuthUser | null | false>;
}
