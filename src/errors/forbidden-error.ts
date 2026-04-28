import { AuthError } from "./auth-error";

export class ForbiddenError extends AuthError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}
