export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgetPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: number;
  departmentId?: number;
  collegeId?: number;
}
