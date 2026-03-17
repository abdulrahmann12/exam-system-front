/**
 * Persists exam answers to localStorage so students don't lose
 * progress on page refresh. Keyed by sessionId.
 */

interface StoredAnswer {
  questionId: number;
  choiceId?: number;
  answerText?: string;
  /** Timestamp of last local save */
  savedAt: number;
  /** Whether the API confirmed this answer */
  synced: boolean;
}

interface StoredSession {
  sessionId: number;
  answers: Record<number, StoredAnswer>;
  /** Set of flagged question IDs */
  flagged: number[];
  /** Last visited question index */
  currentIndex: number;
}

const KEY_PREFIX = "exam_session_";

function key(sessionId: number) {
  return `${KEY_PREFIX}${sessionId}`;
}

function read(sessionId: number): StoredSession | null {
  try {
    const raw = localStorage.getItem(key(sessionId));
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

function write(sessionId: number, data: StoredSession) {
  try {
    localStorage.setItem(key(sessionId), JSON.stringify(data));
  } catch {
    // Storage full or unavailable — silent fail
  }
}

function getOrCreate(sessionId: number): StoredSession {
  return read(sessionId) ?? { sessionId, answers: {}, flagged: [], currentIndex: 0 };
}

export const examStorage = {
  /** Load full session from localStorage */
  load(sessionId: number): StoredSession | null {
    return read(sessionId);
  },

  /** Save an answer (optimistic — synced=false until confirmed) */
  saveAnswer(sessionId: number, answer: Omit<StoredAnswer, "savedAt" | "synced">) {
    const session = getOrCreate(sessionId);
    session.answers[answer.questionId] = {
      ...answer,
      savedAt: Date.now(),
      synced: false,
    };
    write(sessionId, session);
  },

  /** Mark an answer as synced with the server */
  markSynced(sessionId: number, questionId: number) {
    const session = getOrCreate(sessionId);
    const a = session.answers[questionId];
    if (a) {
      a.synced = true;
      write(sessionId, session);
    }
  },

  /** Toggle flag on a question */
  toggleFlag(sessionId: number, questionId: number) {
    const session = getOrCreate(sessionId);
    const idx = session.flagged.indexOf(questionId);
    if (idx >= 0) {
      session.flagged.splice(idx, 1);
    } else {
      session.flagged.push(questionId);
    }
    write(sessionId, session);
    return session.flagged.includes(questionId);
  },

  /** Save current question index */
  saveIndex(sessionId: number, index: number) {
    const session = getOrCreate(sessionId);
    session.currentIndex = index;
    write(sessionId, session);
  },

  /** Get all unsent answers (synced === false) */
  getUnsynced(sessionId: number): StoredAnswer[] {
    const session = read(sessionId);
    if (!session) return [];
    return Object.values(session.answers).filter((a) => !a.synced);
  },

  /** Clean up after exam ends */
  clear(sessionId: number) {
    try {
      localStorage.removeItem(key(sessionId));
    } catch {
      // ignore
    }
  },
};

export type { StoredAnswer, StoredSession };
