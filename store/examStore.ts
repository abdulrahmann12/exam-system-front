import { create } from "zustand";
import { examStorage } from "@/lib/examStorage";
import { sessionService } from "@/services/sessionService";
import type { ExamQuestionItem, ExamQuestionsResponse } from "@/types/session";

// ── Question status for the grid ────────────────────────────
export type QuestionStatus = "not-visited" | "current" | "answered" | "flagged";

export interface AnswerState {
  choiceId?: number;
  answerText?: string;
  /** Optimistic — true once server confirms */
  synced: boolean;
}

interface ExamState {
  // ── Session data ────────────────────────────────────────
  sessionId: number | null;
  examTitle: string;
  questions: ExamQuestionItem[];
  durationMinutes: number;
  perQuestionTimeSeconds: number;
  allowBackNavigation: boolean;
  startedAt: string | null;

  // ── Navigation ──────────────────────────────────────────
  currentIndex: number;
  visited: Set<number>; // question IDs

  // ── Answers (optimistic) ────────────────────────────────
  answers: Record<number, AnswerState>;
  flagged: Set<number>; // question IDs

  // ── Lifecycle ───────────────────────────────────────────
  ended: boolean;
  loading: boolean;

  // ── Actions ─────────────────────────────────────────────
  /** Initialize from API + rehydrate from localStorage */
  init: (data: ExamQuestionsResponse) => void;

  /** Navigate to question index */
  goTo: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;

  /** Optimistic answer submission */
  submitAnswer: (questionId: number, answer: { choiceId?: number; answerText?: string }) => void;

  /** Toggle flag for review */
  toggleFlag: (questionId: number) => void;

  /** End the exam */
  endExam: () => Promise<void>;

  /** Get status of a specific question (for grid colors) */
  getStatus: (questionId: number, index: number) => QuestionStatus;

  /** Progress percentage (answered / total) */
  progress: () => number;
}

export const useExamStore = create<ExamState>((set, get) => ({
  sessionId: null,
  examTitle: "",
  questions: [],
  durationMinutes: 0,
  perQuestionTimeSeconds: 0,
  allowBackNavigation: true,
  startedAt: null,
  currentIndex: 0,
  visited: new Set<number>(),
  answers: {},
  flagged: new Set<number>(),
  ended: false,
  loading: true,

  init: (data) => {
    const stored = examStorage.load(data.sessionId);
    const restoredAnswers: Record<number, AnswerState> = {};

    // Rehydrate answers from localStorage
    if (stored) {
      for (const [qid, a] of Object.entries(stored.answers)) {
        restoredAnswers[Number(qid)] = {
          choiceId: a.choiceId,
          answerText: a.answerText,
          synced: a.synced,
        };
      }
    }

    const firstQid = data.questions[0]?.questionId;
    const restoredIndex = stored?.currentIndex ?? 0;
    const visited = new Set<number>();
    // Mark answered questions as visited
    for (const qid of Object.keys(restoredAnswers)) {
      visited.add(Number(qid));
    }
    // Also mark current question as visited
    const currentQid = data.questions[restoredIndex]?.questionId;
    if (currentQid) visited.add(currentQid);
    if (firstQid) visited.add(firstQid);

    set({
      sessionId: data.sessionId,
      examTitle: data.examTitle ?? "Exam",
      questions: data.questions,
      durationMinutes: data.durationMinutes,
      perQuestionTimeSeconds: data.perQuestionTimeSeconds ?? 0,
      allowBackNavigation: data.allowBackNavigation ?? true,
      startedAt: data.startedAt,
      currentIndex: restoredIndex,
      visited,
      answers: restoredAnswers,
      flagged: new Set(stored?.flagged ?? []),
      ended: false,
      loading: false,
    });
  },

  goTo: (index) => {
    const { questions, sessionId } = get();
    if (index < 0 || index >= questions.length) return;
    const qid = questions[index]?.questionId;
    set((s) => {
      const visited = new Set(s.visited);
      if (qid) visited.add(qid);
      return { currentIndex: index, visited };
    });
    if (sessionId) examStorage.saveIndex(sessionId, index);
  },

  goNext: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) get().goTo(currentIndex + 1);
  },

  goPrev: () => {
    const { currentIndex, allowBackNavigation } = get();
    if (!allowBackNavigation) return;
    if (currentIndex > 0) get().goTo(currentIndex - 1);
  },

  submitAnswer: (questionId, answer) => {
    const { sessionId } = get();
    if (!sessionId) return;

    // 1. Optimistic local update
    set((s) => ({
      answers: {
        ...s.answers,
        [questionId]: { ...answer, synced: false },
      },
    }));

    // 2. Persist to localStorage
    examStorage.saveAnswer(sessionId, { questionId, ...answer });

    // 3. Fire-and-forget API call
    sessionService
      .submitAnswer({
        sessionId,
        questionId,
        ...(answer.choiceId != null && { choiceId: answer.choiceId }),
        ...(answer.answerText != null && { answerText: answer.answerText }),
      })
      .then(() => {
        // Mark synced in both store and localStorage
        set((s) => ({
          answers: {
            ...s.answers,
            [questionId]: { ...s.answers[questionId], ...answer, synced: true },
          },
        }));
        examStorage.markSynced(sessionId, questionId);
      })
      .catch(() => {
        // Answer stays optimistic in state + localStorage
        // Will be retried by heartbeat or on next interaction
      });
  },

  toggleFlag: (questionId) => {
    const { sessionId } = get();
    if (sessionId) examStorage.toggleFlag(sessionId, questionId);
    set((s) => {
      const flagged = new Set(s.flagged);
      if (flagged.has(questionId)) flagged.delete(questionId);
      else flagged.add(questionId);
      return { flagged };
    });
  },

  endExam: async () => {
    const { sessionId } = get();
    if (!sessionId) return;

    // Try to sync any unsynced answers first
    const unsynced = examStorage.getUnsynced(sessionId);
    await Promise.allSettled(
      unsynced.map((a) =>
        sessionService.submitAnswer({
          sessionId,
          questionId: a.questionId,
          ...(a.choiceId != null && { choiceId: a.choiceId }),
          ...(a.answerText != null && { answerText: a.answerText }),
        })
      )
    );

    await sessionService.endSession(sessionId);
    examStorage.clear(sessionId);
    set({ ended: true });
  },

  getStatus: (questionId, index) => {
    const { currentIndex, answers, flagged, visited } = get();
    if (index === currentIndex) return "current";
    if (flagged.has(questionId)) return "flagged";
    if (answers[questionId]) return "answered";
    if (visited.has(questionId)) return "not-visited"; // visited but unanswered
    return "not-visited";
  },

  progress: () => {
    const { questions, answers } = get();
    if (questions.length === 0) return 0;
    return Math.round((Object.keys(answers).length / questions.length) * 100);
  },
}));
