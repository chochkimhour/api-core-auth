import { AuthError } from "./auth-error";

export class UnauthorizedError extends AuthError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}
