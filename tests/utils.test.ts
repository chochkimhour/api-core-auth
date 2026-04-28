import type { Request } from "express";
import { describe, expect, it } from "vitest";
import { createAuthResponse, getAuthUser, sanitizeUser, UnauthorizedError } from "../src";

describe("utility helpers", () => {
  it("removes sensitive password fields", () => {
    const user = sanitizeUser({
      id: "1",
      email: "user@example.com",
      password: "secret",
      passwordHash: "hash"
    });

    expect(user).toEqual({
      id: "1",
      email: "user@example.com"
    });
  });

  it("creates a consistent auth response", () => {
    const response = createAuthResponse({
      user: {
        id: "1"
      },
      accessToken: "access-token"
    });

    expect(response.success).toBe(true);
    expect(response.data.accessToken).toBe("access-token");
  });

  it("gets the authenticated user from a request", () => {
    const req = {
      user: {
        id: "1"
      }
    } as Request;

    expect(getAuthUser(req).id).toBe("1");
  });

  it("throws when authenticated user is not available", () => {
    expect(() => getAuthUser({} as Request)).toThrow(UnauthorizedError);
  });
});
