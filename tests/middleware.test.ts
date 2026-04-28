import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import {
  authMiddleware,
  ForbiddenError,
  generateAccessToken,
  optionalAuthMiddleware,
  roleMiddleware,
  UnauthorizedError
} from "../src";

const secret = "test-secret-that-is-long-enough-for-tests";

function createRequest(token?: string): Request {
  return {
    headers: token ? { authorization: `Bearer ${token}` } : {}
  } as Request;
}

describe("Express middleware", () => {
  it("attaches req.user for valid tokens", () => {
    const token = generateAccessToken({ id: "1", role: "ADMIN" }, secret);
    const req = createRequest(token);
    const next = vi.fn() as NextFunction;

    authMiddleware({ secret })(req, {} as Response, next);

    expect(req.user?.id).toBe("1");
    expect(req.user?.role).toBe("ADMIN");
    expect(next).toHaveBeenCalledWith();
  });

  it("passes UnauthorizedError when a token is missing", () => {
    const req = createRequest();
    const next = vi.fn() as NextFunction;

    authMiddleware({ secret })(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it("optional auth continues when token is missing or invalid", () => {
    const req = createRequest("invalid-token");
    const next = vi.fn() as NextFunction;

    optionalAuthMiddleware({ secret })(req, {} as Response, next);

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
