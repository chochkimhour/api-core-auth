import type { NextFunction, Request, Response } from "express";
import { InvalidTokenError } from "../errors/invalid-token-error";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { extractBearerToken } from "../jwt/extract-bearer-token";
import { verifyToken } from "../jwt/verify-token";
import type { AuthMiddlewareOptions } from "../types/auth-middleware-options";
import { defaultMapPayloadToUser } from "./payload-to-user";

export function authMiddleware(options: AuthMiddlewareOptions) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const token =
      options.tokenExtractor?.(req) ?? extractBearerToken(req.headers.authorization ?? null);

    if (!token) {
      next(new UnauthorizedError("Authentication token is required"));
      return;
    }

    try {
      const payload = verifyToken(token, options.secret, options.verifyOptions);
      const user = (options.mapPayloadToUser ?? defaultMapPayloadToUser)(payload);

      if (!user || typeof user !== "object") {
        next(new InvalidTokenError());
        return;
      }

      req.user = user;
      req.auth = {
        token,
        payload
      };
      next();
    } catch (error) {
      next(error);
    }
  };
}
