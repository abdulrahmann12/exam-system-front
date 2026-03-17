import client from "@/lib/api/client";
import type { BasicResponse, PageResponse } from "@/types/api";
import type {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from "@/types/department";

export const departmentService = {
  create: (body: CreateDepartmentRequest) =>
    client.post<BasicResponse<Department>>("/departments", body),

  update: (departmentId: number, body: UpdateDepartmentRequest) =>
    client.put<BasicResponse<Department>>(`/departments/${departmentId}`, body),

  getById: (departmentId: number) =>
    client.get<BasicResponse<Department>>(`/departments/${departmentId}`),

  getByName: (departmentName: string, params?: { page?: number; size?: number }) =>
    client.get<BasicResponse<PageResponse<Department>>>("/departments/by-name", {
      params: { departmentName, ...params },
    }),

  getAll: (params?: { page?: number; size?: number }) =>
    client.get<BasicResponse<PageResponse<Department>>>("/departments", { params }),

  getByCollege: (collegeId: number) =>
    client.get<BasicResponse<Department[]>>(`/departments/by-college/${collegeId}`),

  search: (params: { keyword: string; page?: number; size?: number }) =>
    client.get<BasicResponse<PageResponse<Department>>>("/departments/search", { params }),

  delete: (departmentId: number) =>
    client.delete<BasicResponse<null>>(`/departments/${departmentId}`),
};
