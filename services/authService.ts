import client from "@/lib/api/client";
import { getRefreshToken } from "@/lib/auth/token";
import type { BasicResponse } from "@/types/api";
import type {
  LoginRequest,
  AuthResponse,
  ChangePasswordRequest,
  ForgetPasswordRequest,
  ResetPasswordRequest,
  CreateUserRequest,
} from "@/types/auth";

export const authService = {
  login: (body: LoginRequest) =>
    client.post<BasicResponse<AuthResponse>>("/auth/login", body),

  refreshToken: () =>
    client.post<BasicResponse<AuthResponse>>("/auth/refresh-token"),

  logout: async () => {
    const refresh = getRefreshToken();
    try {
      await client.post<BasicResponse<null>>("/auth/logout", {}, {
        headers: refresh ? { Authorization: `Bearer ${refresh}` } : {},
      });
    } catch {
      /* ignore */
    }
  },

  changePassword: (body: ChangePasswordRequest) =>
    client.post<BasicResponse<null>>("/auth/change-password", body),

  forgetPassword: (body: ForgetPasswordRequest) =>
    client.post<BasicResponse<null>>("/auth/forget-password", body),

  resetPassword: (body: ResetPasswordRequest) =>
    client.post<BasicResponse<null>>("/auth/reset-password", body),

  regenerateCode: () =>
    client.post<BasicResponse<null>>("/auth/regenerate-code"),

  createUser: (body: CreateUserRequest) =>
    client.post<BasicResponse<unknown>>("/auth/create-user", body),
};
