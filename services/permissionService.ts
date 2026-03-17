import client from "@/lib/api/client";
import type { BasicResponse, PageResponse } from "@/types/api";
import type {
  Permission,
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from "@/types/permission";

export const permissionService = {
  create: (body: CreatePermissionRequest) =>
    client.post<BasicResponse<Permission>>("/permissions", body),

  update: (permissionId: number, body: UpdatePermissionRequest) =>
    client.put<BasicResponse<Permission>>(`/permissions/${permissionId}`, body),

  getById: (permissionId: number) =>
    client.get<BasicResponse<Permission>>(`/permissions/${permissionId}`),

  getAll: (params?: { page?: number; size?: number }) =>
    client.get<BasicResponse<PageResponse<Permission>>>("/permissions", { params }),

  getModules: () =>
    client.get<BasicResponse<string[]>>("/permissions/modules"),

  getActions: () =>
    client.get<BasicResponse<string[]>>("/permissions/actions"),

  delete: (permissionId: number) =>
    client.delete<BasicResponse<null>>(`/permissions/${permissionId}`),
};
