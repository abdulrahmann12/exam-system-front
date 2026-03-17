export type QuestionType = "MCQ" | "TRUE_FALSE" | "ESSAY";

export interface ChoiceDto {
  choiceId?: number;
  choiceText: string;
  isCorrect: boolean;
  choiceOrder: number;
}

export interface QuestionDto {
  questionId?: number;
  questionText: string;
  questionType: QuestionType;
  marks: number;
  questionOrder: number;
  choices: ChoiceDto[];
}

export interface CreateExamRequest {
  title: string;
  description: string;
  collegeId: number;
  departmentId: number;
  subjectId: number;
  durationMinutes: number;
  perQuestionTimeSeconds: number;
  allowBackNavigation: boolean;
  randomizeQuestions: boolean;
  startTime: string;
  endTime: string;
  isActive: boolean;
  questions: QuestionDto[];
}

export interface UpdateExamRequest extends CreateExamRequest {}

export interface ExamSummary {
  examId: number;
  title: string;
  description?: string;
  collegeId?: number;
  departmentId?: number;
  subjectId?: number;
  collegeName?: string;
  departmentName?: string;
  subjectName?: string;
  durationMinutes: number;
  perQuestionTimeSeconds?: number;
  allowBackNavigation: boolean;
  randomizeQuestions: boolean;
  totalQuestions: number;
  isActive: boolean;
  startTime: string;
  endTime: string;
  qrCodeUrl?: string;
  qrToken?: string;
  qrExpiresAt?: string;
  createdBy?: number;
}

export interface ExamDetail extends ExamSummary {
  questions: QuestionDetail[];
}

export interface QuestionDetail {
  questionId: number;
  questionText: string;
  questionType: QuestionType;
  marks: number;
  questionOrder: number;
  choices: ChoiceDetail[];
}

export interface ChoiceDetail {
  choiceId: number;
  choiceText: string;
  isCorrect: boolean;
  choiceOrder: number;
}

export interface QrResponse {
  examId: number;
  qrCodeUrl: string;
  qrToken: string;
  expiresAt: string;
}
