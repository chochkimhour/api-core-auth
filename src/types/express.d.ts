import type { AuthUser } from "./auth-user";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      auth?: {
        token: string;
        payload: unknown;
      };
    }
  }
}

export {};
