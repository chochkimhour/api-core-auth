import type { JwtPayload as JsonWebTokenPayload } from "jsonwebtoken";
import type { AuthUser } from "./auth-user";

export interface JwtPayload extends JsonWebTokenPayload {
  user?: AuthUser;
  id?: string | number;
  email?: string;
  username?: string;
  role?: string;
  roles?: string[];
  [key: string]: unknown;
}
