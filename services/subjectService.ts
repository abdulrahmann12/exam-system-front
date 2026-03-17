import client from "@/lib/api/client";
import type { BasicResponse, PageResponse } from "@/types/api";
import type {
  Subject,
  CreateSubjectRequest,
  UpdateSubjectRequest,
} from "@/types/subject";

export const subjectService = {
  create: (body: CreateSubjectRequest) =>
    client.post<BasicResponse<Subject>>("/subjects", body),

  update: (subjectId: number, body: UpdateSubjectRequest) =>
    client.put<BasicResponse<Subject>>(`/subjects/${subjectId}`, body),

  getById: (subjectId: number) =>
    client.get<BasicResponse<Subject>>(`/subjects/${subjectId}`),

  getAll: (params?: { page?: number; size?: number }) =>
    client.get<BasicResponse<PageResponse<Subject>>>("/subjects", { params }),

  getByDepartment: (departmentId: number) =>
    client.get<BasicResponse<Subject[]>>(`/subjects/by-department/${departmentId}`),

  getByCollege: (collegeId: number) =>
    client.get<BasicResponse<Subject[]>>(`/subjects/by-college/${collegeId}`),

  search: (params: { keyword: string }) =>
    client.get<BasicResponse<PageResponse<Subject>>>("/subjects/search", { params }),

  delete: (subjectId: number) =>
    client.delete<BasicResponse<null>>(`/subjects/${subjectId}`),
};
