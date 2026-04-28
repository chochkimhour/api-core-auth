import { AuthError } from "./auth-error";

export class InvalidTokenError extends AuthError {
  constructor(message = "Invalid token") {
    super(message, 401, "INVALID_TOKEN");
  }
}
