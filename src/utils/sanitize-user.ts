const DEFAULT_SENSITIVE_KEYS = [
  "password",
  "passwordHash",
  "hashedPassword",
  "hash",
  "salt",
  "resetToken",
  "verificationToken"
];

export function sanitizeUser<TUser extends Record<string, unknown>>(
  user: TUser,
  sensitiveKeys: string[] = DEFAULT_SENSITIVE_KEYS
): Partial<TUser> {
  const sanitized = { ...user };
  const blockedKeys = new Set(sensitiveKeys.map((key) => key.toLowerCase()));

  for (const key of Object.keys(sanitized)) {
    if (blockedKeys.has(key.toLowerCase())) {
      delete sanitized[key];
    }
  }

  return sanitized;
}
