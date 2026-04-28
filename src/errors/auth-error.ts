export class AuthError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly expose: boolean;

  constructor(message = "Authentication error", statusCode = 500, code = "AUTH_ERROR") {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    this.expose = statusCode >= 400 && statusCode < 500;
    Error.captureStackTrace?.(this, new.target);
  }
}
