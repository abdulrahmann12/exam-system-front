import client from "@/lib/api/client";
import type { BasicResponse, PageResponse } from "@/types/api";
import type { College, CreateCollegeRequest, UpdateCollegeRequest } from "@/types/college";

export const collegeService = {
  create: (body: CreateCollegeRequest) =>
    client.post<BasicResponse<College>>("/colleges", body),

  update: (collegeId: number, body: UpdateCollegeRequest) =>
    client.put<BasicResponse<College>>(`/colleges/${collegeId}`, body),

  getById: (collegeId: number) =>
    client.get<BasicResponse<College>>(`/colleges/${collegeId}`),

  getByName: (collegeName: string) =>
    client.get<BasicResponse<College>>("/colleges/by-name", { params: { collegeName } }),

  getAll: (params?: { page?: number; size?: number }) =>
    client.get<BasicResponse<PageResponse<College>>>("/colleges", { params }),

  search: (params: { keyword: string; page?: number; size?: number }) =>
    client.get<BasicResponse<PageResponse<College>>>("/colleges/search", { params }),

  delete: (collegeId: number) =>
    client.delete<BasicResponse<null>>(`/colleges/${collegeId}`),
};
