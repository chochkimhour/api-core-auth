import { describe, expect, it } from "vitest";
import { comparePassword, hashPassword, validatePasswordStrength } from "../src";

describe("password helpers", () => {
  it("hashes and compares passwords", async () => {
    const hash = await hashPassword("Password123");

    await expect(comparePassword("Password123", hash)).resolves.toBe(true);
    await expect(comparePassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("validates password strength", () => {
    expect(validatePasswordStrength("Password123").valid).toBe(true);

    const weak = validatePasswordStrength("short");

    expect(weak.valid).toBe(false);
    expect(weak.errors.length).toBeGreaterThan(0);
  });

  it("supports stricter symbol requirements", () => {
    const result = validatePasswordStrength("Password123", {
      requireSymbol: true
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password must contain at least one symbol");
  });
});
