import client from "@/lib/api/client";
import type { BasicResponse } from "@/types/api";
import type {
  ExamAccessResponse,
  VerifyStudentRequest,
  StartExamRequest,
  StartExamResponse,
  ExamQuestionsResponse,
  SubmitAnswerRequest,
  StudentExamSessionSummary,
  SessionResult,
  AdminDashboardStats,
  StudentDashboardStats,
} from "@/types/session";

export const sessionService = {
  access: (token: string) =>
    client.get<BasicResponse<ExamAccessResponse>>("/sessions/access", { params: { token } }),

  verifyStudent: (body: VerifyStudentRequest) =>
    client.post<BasicResponse<null>>("/sessions/verify-student", body),

  start: (body: StartExamRequest) =>
    client.post<BasicResponse<StartExamResponse>>("/sessions/start", body),

  getQuestions: (sessionId: number) =>
    client.get<BasicResponse<ExamQuestionsResponse>>(`/sessions/${sessionId}/questions`),

  submitAnswer: (body: SubmitAnswerRequest) =>
    client.post<BasicResponse<null>>("/sessions/submit-answer", body),

  endSession: (sessionId: number) =>
    client.post<BasicResponse<null>>(`/sessions/end/${sessionId}`),

  getMyExams: () =>
    client.get<BasicResponse<StudentExamSessionSummary[]>>("/sessions/my-exams"),

  getSession: (sessionId: number) =>
    client.get<BasicResponse<StudentExamSessionSummary>>(`/sessions/${sessionId}`),

  getResult: (sessionId: number) =>
    client.get<BasicResponse<SessionResult>>(`/sessions/${sessionId}/result`),

  getAdminStats: (params?: { collegeId?: number; departmentId?: number }) =>
    client.get<BasicResponse<AdminDashboardStats>>("/sessions/stats/admin", { params }),

  getStudentStats: () =>
    client.get<BasicResponse<StudentDashboardStats>>("/sessions/stats/student"),
};
