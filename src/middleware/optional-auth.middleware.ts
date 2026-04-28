import type { NextFunction, Request, Response } from "express";
import { extractBearerToken } from "../jwt/extract-bearer-token";
import { verifyToken } from "../jwt/verify-token";
import type { AuthMiddlewareOptions } from "../types/auth-middleware-options";
import { defaultMapPayloadToUser } from "./payload-to-user";

export function optionalAuthMiddleware(options: AuthMiddlewareOptions) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const token =
      options.tokenExtractor?.(req) ?? extractBearerToken(req.headers.authorization ?? null);

    if (!token) {
      next();
      return;
    }

    try {
      const payload = verifyToken(token, options.secret, options.verifyOptions);
      req.user = (options.mapPayloadToUser ?? defaultMapPayloadToUser)(payload);
      req.auth = {
        token,
        payload
      };
    } catch {
      req.user = undefined;
      req.auth = undefined;
    }

    next();
  };
}
