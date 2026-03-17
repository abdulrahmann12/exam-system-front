import client from "@/lib/api/client";
import type { BasicResponse, PageResponse } from "@/types/api";
import type {
  CreateExamRequest,
  UpdateExamRequest,
  ExamSummary,
  ExamDetail,
  QrResponse,
} from "@/types/exam";

export const examService = {
  create: (body: CreateExamRequest) =>
    client.post<BasicResponse<ExamSummary>>("/exams", body),

  update: (examId: number, body: UpdateExamRequest) =>
    client.put<BasicResponse<ExamSummary>>(`/exams/${examId}`, body),

  getById: (examId: number) =>
    client.get<BasicResponse<ExamDetail>>(`/exams/${examId}`),

  getAll: (params?: { page?: number; size?: number }) =>
    client.get<BasicResponse<PageResponse<ExamSummary>>>("/exams", { params }),

  getActive: (params?: { page?: number; size?: number }) =>
    client.get<BasicResponse<PageResponse<ExamSummary>>>("/exams/active", { params }),

  getMyExams: (params?: { page?: number; size?: number }) =>
    client.get<BasicResponse<PageResponse<ExamSummary>>>("/exams/my", { params }),

  getByCollege: (collegeId: number, params?: { page?: number; size?: number }) =>
    client.get<BasicResponse<PageResponse<ExamSummary>>>(`/exams/college/${collegeId}`, { params }),

  getByDepartment: (departmentId: number, params?: { page?: number; size?: number }) =>
    client.get<BasicResponse<PageResponse<ExamSummary>>>(`/exams/department/${departmentId}`, { params }),

  getBySubject: (subjectId: number, params?: { page?: number; size?: number }) =>
    client.get<BasicResponse<PageResponse<ExamSummary>>>(`/exams/subject/${subjectId}`, { params }),

  getByUser: (userId: number, params?: { page?: number; size?: number }) =>
    client.get<BasicResponse<PageResponse<ExamSummary>>>(`/exams/user/${userId}`, { params }),

  search: (params: { keyword: string; page?: number; size?: number }) =>
    client.get<BasicResponse<PageResponse<ExamSummary>>>("/exams/search", { params }),

  generateQr: (examId: number) =>
    client.post<BasicResponse<QrResponse>>(`/exams/${examId}/qr`),

  deactivate: (examId: number) =>
    client.delete<BasicResponse<null>>(`/exams/deactivate/${examId}`),

  delete: (examId: number) =>
    client.delete<BasicResponse<null>>(`/exams/${examId}`),
};
