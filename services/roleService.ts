import client from "@/lib/api/client";
import type { BasicResponse, PageResponse } from "@/types/api";
import type { Role, CreateRoleRequest, UpdateRoleRequest } from "@/types/role";

export const roleService = {
  create: (body: CreateRoleRequest) =>
    client.post<BasicResponse<Role>>("/roles", body),

  update: (roleId: number, body: UpdateRoleRequest) =>
    client.put<BasicResponse<Role>>(`/roles/${roleId}`, body),

  getById: (roleId: number) =>
    client.get<BasicResponse<Role>>(`/roles/${roleId}`),

  getByName: (roleName: string) =>
    client.get<BasicResponse<Role>>("/roles/by-name", { params: { roleName } }),

  getAll: (params?: { page?: number; size?: number }) =>
    client.get<BasicResponse<PageResponse<Role>>>("/roles", { params }),

  delete: (roleId: number) =>
    client.delete<BasicResponse<null>>(`/roles/${roleId}`),
};
