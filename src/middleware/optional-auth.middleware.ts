import type { NextFunction, Request, Response } from "express";
import { extractBearerToken } from "../opaque/extract-bearer-token";
import type { AuthMiddlewareOptions } from "../types/auth-middleware-options";

export function optionalAuthMiddleware(options: AuthMiddlewareOptions) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const token =
      options.tokenExtractor?.(req) ?? extractBearerToken(req.headers.authorization ?? null);

    if (!token) {
      next();
      return;
    }

    try {
      const user = await options.verifyToken(token, req);

      if (user && typeof user === "object") {
        req.user = user;
        req.auth = {
          token
        };
      }
    } catch {
      req.user = undefined;
      req.auth = undefined;
    }

    next();
  };
}
