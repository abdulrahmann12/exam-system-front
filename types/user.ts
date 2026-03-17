export interface UserProfile {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  isActive: boolean;
  roleId?: number;
  roleName?: string;
  collegeId?: number;
  departmentId?: number;
  collegeName?: string;
  departmentName?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ChangeUsernameRequest {
  newUsername: string;
}

export interface EmailChangeRequestRequest {
  newEmail: string;
}

export interface EmailChangeConfirmRequest {
  code: string;
}

export interface AdminUpdateUserRequest {
  roleId?: number;
  collegeId?: number;
  departmentId?: number;
  isActive?: boolean;
}
