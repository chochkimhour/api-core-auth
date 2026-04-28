import { describe, expect, it } from "vitest";
import {
  compareOpaqueToken,
  createOpaqueToken,
  extractBearerToken,
  generateOpaqueToken,
  hashOpaqueToken
} from "../src";

describe("opaque token helpers", () => {
  it("generates a secure random opaque token", () => {
    const token = generateOpaqueToken();

    expect(token).toBeTypeOf("string");
    expect(token.length).toBeGreaterThan(20);
    expect(token).not.toContain(".");
  });

  it("creates a token and storage-safe hash", () => {
    const result = createOpaqueToken();

    expect(result.token).toBeTypeOf("string");
    expect(result.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.tokenHash).not.toBe(result.token);
  });

  it("compares opaque tokens using their hashes", () => {
    const token = generateOpaqueToken();
    const hash = hashOpaqueToken(token);

    expect(compareOpaqueToken(token, hash)).toBe(true);
    expect(compareOpaqueToken("wrong-token", hash)).toBe(false);
  });

  it("supports an application pepper", () => {
    const pepper = "server-side-secret-pepper";
    const token = generateOpaqueToken();
    const hash = hashOpaqueToken(token, pepper);

    expect(compareOpaqueToken(token, hash, pepper)).toBe(true);
    expect(compareOpaqueToken(token, hash)).toBe(false);
  });

  it("rejects weak byte lengths", () => {
    expect(() => generateOpaqueToken({ byteLength: 8 })).toThrow(TypeError);
  });

  it("extracts valid Bearer tokens", () => {
    expect(extractBearerToken("Bearer secure-token")).toBe("secure-token");
    expect(extractBearerToken("bearer secure-token")).toBe("secure-token");
  });

  it("rejects malformed Bearer headers", () => {
    expect(extractBearerToken("Token value")).toBeNull();
    expect(extractBearerToken("Bearer")).toBeNull();
    expect(extractBearerToken("Bearer token extra")).toBeNull();
    expect(extractBearerToken(null)).toBeNull();
  });
});
