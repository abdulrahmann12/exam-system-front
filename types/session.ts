export interface ExamAccessResponse {
  examId: number;
  title: string;
  description?: string;
  durationMinutes: number;
  totalQuestions: number;
  startTime: string;
  endTime: string;
}

export interface VerifyStudentRequest {
  examId: number;
  studentCode: string;
  token: string;
}

export interface StartExamRequest {
  examId: number;
  studentCode: string;
  token: string;
}

export interface StartExamResponse {
  sessionId: number;
  sessionCode: string;
  startedAt: string;
}

export interface ExamQuestionItem {
  questionId: number;
  questionText: string;
  questionType: string;
  marks: number;
  questionOrder: number;
  choices: { choiceId: number; choiceText: string; choiceOrder: number }[];
}

export interface ExamQuestionsResponse {
  sessionId: number;
  examTitle: string;
  questions: ExamQuestionItem[];
  durationMinutes: number;
  perQuestionTimeSeconds: number;
  allowBackNavigation: boolean;
  startedAt: string;
}

export interface SubmitAnswerRequest {
  sessionId: number;
  questionId: number;
  choiceId?: number;
  answerText?: string;
}

export interface StudentExamSessionSummary {
  sessionId: number;
  sessionCode: string;
  examId: number;
  examTitle: string;
  isActive: boolean;
  startedAt: string;
  endedAt?: string;
  totalMark?: number;
  maxMark?: number;
}

// ── Result types ────────────────────────────────────────────

export interface AnswerResult {
  questionId: number;
  questionText: string;
  questionType: string;
  marks: number;
  earnedMarks: number;
  selectedChoiceId?: number;
  correctChoiceId?: number;
  answerText?: string;
  isCorrect: boolean;
  choices: { choiceId: number; choiceText: string; isCorrect: boolean }[];
}

export interface SessionResult {
  sessionId: number;
  sessionCode: string;
  examId: number;
  examTitle: string;
  totalMark: number;
  maxMark: number;
  percentage: number;
  passed: boolean;
  startedAt: string;
  endedAt: string;
  answers: AnswerResult[];
}

// ── Dashboard stats types ───────────────────────────────────

export interface AdminDashboardStats {
  totalStudents: number;
  totalExams: number;
  activeSessions: number;
  completedSessions: number;
  passRate: number;
  failRate: number;
  recentExams: { examId: number; title: string; createdAt: string; totalQuestions: number }[];
  resultDistribution: { label: string; value: number }[];
}

export interface StudentDashboardStats {
  examsTaken: number;
  averageScore: number;
  upcomingExams: { examId: number; title: string; startTime: string; durationMinutes: number }[];
}
