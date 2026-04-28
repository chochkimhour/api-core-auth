import { describe, expect, it } from "vitest";
import {
  decodeToken,
  extractBearerToken,
  generateAccessToken,
  generateRefreshToken,
  generateToken,
  InvalidTokenError,
  verifyToken
} from "../src";

const secret = "test-secret-that-is-long-enough-for-tests";

describe("JWT helpers", () => {
  it("generates and verifies an access token", () => {
    const token = generateAccessToken({ id: "1", email: "user@example.com" }, secret);
    const payload = verifyToken(token, secret);

    expect(payload.id).toBe("1");
    expect(payload.email).toBe("user@example.com");
  });

  it("generates refresh tokens with default expiration", () => {
    const token = generateRefreshToken({ id: "1" }, secret);
    const payload = decodeToken(token);

    expect(payload?.id).toBe("1");
    expect(payload?.exp).toBeTypeOf("number");
  });

  it("supports custom sign options", () => {
    const token = generateToken({ id: "1" }, secret, {
      issuer: "api-core-auth"
    });
    const payload = verifyToken(token, secret, {
      issuer: "api-core-auth"
    });

    expect(payload.id).toBe("1");
  });

  it("throws a safe package error for invalid tokens", () => {
    expect(() => verifyToken("not-a-token", secret)).toThrow(InvalidTokenError);
  });

  it("extracts valid Bearer tokens", () => {
    expect(extractBearerToken("Bearer abc.def.ghi")).toBe("abc.def.ghi");
    expect(extractBearerToken("bearer token")).toBe("token");
  });

  it("rejects malformed Bearer headers", () => {
    expect(extractBearerToken("Token value")).toBeNull();
    expect(extractBearerToken("Bearer")).toBeNull();
    expect(extractBearerToken("Bearer token extra")).toBeNull();
    expect(extractBearerToken(null)).toBeNull();
  });
});
