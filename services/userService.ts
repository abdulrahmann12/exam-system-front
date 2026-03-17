import client from "@/lib/api/client";
import type { BasicResponse, PageResponse } from "@/types/api";
import type {
  UserProfile,
  UpdateProfileRequest,
  ChangeUsernameRequest,
  EmailChangeRequestRequest,
  EmailChangeConfirmRequest,
  AdminUpdateUserRequest,
} from "@/types/user";

export const userService = {
  getProfile: () =>
    client.get<BasicResponse<UserProfile>>("/users/profile"),

  updateProfile: (body: UpdateProfileRequest) =>
    client.put<BasicResponse<UserProfile>>("/users/profile", body),

  changeUsername: (body: ChangeUsernameRequest) =>
    client.put<BasicResponse<null>>("/users/profile/username", body),

  requestEmailChange: (body: EmailChangeRequestRequest) =>
    client.post<BasicResponse<null>>("/users/profile/email/request", body),

  confirmEmailChange: (body: EmailChangeConfirmRequest) =>
    client.post<BasicResponse<null>>("/users/profile/email/confirm", body),

  getById: (userId: number) =>
    client.get<BasicResponse<UserProfile>>(`/users/${userId}`),

  getAll: (params?: { page?: number; size?: number }) =>
    client.get<BasicResponse<PageResponse<UserProfile>>>("/users", { params }),

  getByCollege: (collegeId: number) =>
    client.get<BasicResponse<UserProfile[]>>(`/users/by-college/${collegeId}`),

  getByDepartment: (departmentId: number) =>
    client.get<BasicResponse<UserProfile[]>>(`/users/by-department/${departmentId}`),

  getByRole: (roleName: string) =>
    client.get<BasicResponse<UserProfile[]>>("/users/by-role", { params: { roleName } }),

  search: (params?: { keyword?: string; roleId?: number; collegeId?: number; departmentId?: number; isActive?: boolean; page?: number; size?: number }) =>
    client.get<BasicResponse<PageResponse<UserProfile>>>("/users/search", { params }),

  updateUser: (userId: number, body: AdminUpdateUserRequest) =>
    client.put<BasicResponse<UserProfile>>(`/users/${userId}`, body),

  deactivate: (userId: number) =>
    client.delete<BasicResponse<null>>(`/users/${userId}`),

  activate: (userId: number) =>
    client.put<BasicResponse<null>>(`/users/${userId}/activate`),
};
