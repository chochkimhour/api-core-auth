import type { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../errors/forbidden-error";
import { UnauthorizedError } from "../errors/unauthorized-error";
import type { Role } from "../types/role";

function getUserRoles(req: Request): Role[] {
  if (!req.user) {
    return [];
  }

  const roles = new Set<Role>();

  if (req.user.role) {
    roles.add(req.user.role);
  }

  if (Array.isArray(req.user.roles)) {
    for (const role of req.user.roles) {
      roles.add(role);
    }
  }

  return [...roles];
}

export function roleMiddleware(allowedRoles: Role | Role[]) {
  const requiredRoles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError("Authentication is required"));
      return;
    }

    const userRoles = getUserRoles(req);
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      next(new ForbiddenError("Insufficient permissions"));
      return;
    }

    next();
  };
}
