import type { AuthUser } from "../types/auth-user";
import type { TokenPair } from "../types/token-pair";

export interface AuthResponse<TUser extends AuthUser = AuthUser> {
  success: true;
  message: string;
  data: {
    user: TUser;
    token?: string;
    accessToken?: string;
    refreshToken?: string;
    tokens?: TokenPair;
  };
}

export interface CreateAuthResponseOptions<TUser extends AuthUser = AuthUser> {
  user: TUser;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  tokens?: TokenPair;
  message?: string;
}

export function createAuthResponse<TUser extends AuthUser = AuthUser>({
  user,
  token,
  accessToken,
  refreshToken,
  tokens,
  message = "Authentication successful"
}: CreateAuthResponseOptions<TUser>): AuthResponse<TUser> {
  return {
    success: true,
    message,
    data: {
      user,
      ...(token ? { token } : {}),
      ...(accessToken ? { accessToken } : {}),
      ...(refreshToken ? { refreshToken } : {}),
      ...(tokens ? { tokens } : {})
    }
  };
}
