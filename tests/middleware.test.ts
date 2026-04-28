import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import {
  authMiddleware,
  compareOpaqueToken,
  createOpaqueToken,
  ForbiddenError,
  optionalAuthMiddleware,
  roleMiddleware,
  UnauthorizedError
} from "../src";

function createRequest(token?: string): Request {
  return {
    headers: token ? { authorization: `Bearer ${token}` } : {}
  } as Request;
}

describe("Express middleware", () => {
  it("attaches req.user for valid tokens", async () => {
    const tokenPair = createOpaqueToken();
    const req = createRequest(tokenPair.token);
    const next = vi.fn() as NextFunction;

    await authMiddleware({
      verifyToken: (token) =>
        compareOpaqueToken(token, tokenPair.tokenHash) ? { id: "1", role: "ADMIN" } : null
    })(req, {} as Response, next);

    expect(req.user?.id).toBe("1");
    expect(req.user?.role).toBe("ADMIN");
    expect(next).toHaveBeenCalledWith();
  });

  it("passes UnauthorizedError when a token is missing", async () => {
    const req = createRequest();
    const next = vi.fn() as NextFunction;

    await authMiddleware({
      verifyToken: () => ({ id: "1" })
    })(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it("optional auth continues when token is missing or invalid", async () => {
    const req = createRequest("invalid-token");
    const next = vi.fn() as NextFunction;

    await optionalAuthMiddleware({
      verifyToken: () => null
    })(req, {} as Response, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledWith();
  });

  it("allows users with an accepted role", () => {
    const req = {
      user: {
        id: "1",
        role: "ADMIN"
      }
    } as Request;
    const next = vi.fn() as NextFunction;

    roleMiddleware(["ADMIN"])(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("rejects users without accepted roles", () => {
    const req = {
      user: {
        id: "1",
        role: "USER"
      }
    } as Request;
    const next = vi.fn() as NextFunction;

    roleMiddleware(["ADMIN"])(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });
});
