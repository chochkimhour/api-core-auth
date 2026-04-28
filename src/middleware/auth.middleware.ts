import type { NextFunction, Request, Response } from "express";
import { InvalidTokenError } from "../errors/invalid-token-error";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { extractBearerToken } from "../opaque/extract-bearer-token";
import type { AuthMiddlewareOptions } from "../types/auth-middleware-options";

export function authMiddleware(options: AuthMiddlewareOptions) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const token =
      options.tokenExtractor?.(req) ?? extractBearerToken(req.headers.authorization ?? null);

    if (!token) {
      next(new UnauthorizedError("Authentication token is required"));
      return;
    }

    try {
      const user = await options.verifyToken(token, req);

      if (!user || typeof user !== "object") {
        next(new InvalidTokenError());
        return;
      }

      req.user = user;
      req.auth = {
        token
      };
      next();
    } catch (error) {
      next(error instanceof Error ? error : new InvalidTokenError());
    }
  };
}
