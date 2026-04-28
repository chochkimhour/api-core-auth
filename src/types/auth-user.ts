import type { Role } from "./role";

export interface AuthUser {
  id: string | number;
  email?: string;
  username?: string;
  role?: Role;
  roles?: Role[];
  [key: string]: unknown;
}
