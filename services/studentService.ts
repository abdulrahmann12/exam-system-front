import client from "@/lib/api/client";
import type { BasicResponse, PageResponse } from "@/types/api";
import type {
  StudentRegisterRequest,
  StudentProfile,
  UpdateStudentProfileRequest,
} from "@/types/student";

export const studentService = {
  register: (body: StudentRegisterRequest) =>
    client.post<BasicResponse<StudentProfile>>("/students/register", body),

  getMe: () =>
    client.get<BasicResponse<StudentProfile>>("/students/me"),

  updateMe: (body: UpdateStudentProfileRequest) =>
    client.put<BasicResponse<StudentProfile>>("/students/me", body),

  getById: (studentId: number) =>
    client.get<BasicResponse<StudentProfile>>(`/students/${studentId}`),

  getAll: (params?: { page?: number; size?: number }) =>
    client.get<BasicResponse<PageResponse<StudentProfile> | StudentProfile[]>>("/students", { params }),

  getActive: () =>
    client.get<BasicResponse<StudentProfile[]>>("/students/active"),

  getByDepartment: (departmentId: number) =>
    client.get<BasicResponse<StudentProfile[]>>(`/students/department/${departmentId}`),

  getByCollege: (collegeId: number) =>
    client.get<BasicResponse<StudentProfile[]>>(`/students/college/${collegeId}`),

  search: (params?: { studentCode?: string; academicYear?: number; isActive?: boolean; page?: number; size?: number }) =>
    client.get<BasicResponse<PageResponse<StudentProfile>>>("/students/search", { params }),

  countByYear: (year: number) =>
    client.get<BasicResponse<number>>("/students/count/year", { params: { year } }),

  countActive: () =>
    client.get<BasicResponse<number>>("/students/count/active"),

  update: (studentId: number, body: UpdateStudentProfileRequest) =>
    client.put<BasicResponse<StudentProfile>>(`/students/${studentId}`, body),

  activate: (studentId: number) =>
    client.post<BasicResponse<null>>(`/students/${studentId}/activate`),

  deactivate: (studentId: number) =>
    client.delete<BasicResponse<null>>(`/students/${studentId}/deactivate`),

  delete: (studentId: number) =>
    client.delete<BasicResponse<null>>(`/students/${studentId}/delete`),
};
