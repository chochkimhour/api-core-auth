import { AuthError } from "./auth-error";

export class TokenExpiredAuthError extends AuthError {
  constructor(message = "Token expired") {
    super(message, 401, "TOKEN_EXPIRED");
  }
}
