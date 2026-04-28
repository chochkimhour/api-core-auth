import bcrypt from "bcryptjs";

export async function hashPassword(password: string, saltRounds = 10): Promise<string> {
  if (typeof password !== "string" || password.length === 0) {
    throw new TypeError("Password must be a non-empty string");
  }

  return bcrypt.hash(password, saltRounds);
}
