"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useExamStore } from "@/store/examStore";

const WARNING_THRESHOLD = 60; // seconds

interface TimerState {
  /** Seconds remaining for the global exam timer */
  globalSeconds: number;
  /** Seconds remaining for the per-question timer (0 = no limit) */
  questionSeconds: number;
  /** Formatted global time string MM:SS */
  globalDisplay: string;
  /** Formatted question time string MM:SS (empty if no limit) */
  questionDisplay: string;
  /** True when global timer is in warning zone */
  globalWarning: boolean;
  /** True when question timer is in warning zone */
  questionWarning: boolean;
  /** True when global time is up */
  globalExpired: boolean;
  /** True when per-question time is up */
  questionExpired: boolean;
}

function formatTime(sec: number): string {
  if (sec <= 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Manages both the global exam timer and the per-question timer.
 * Calls `onGlobalExpire` when the overall exam time is up,
 * and `onQuestionExpire` when a per-question timer hits zero.
 */
export function useExamTimer(opts: {
  onGlobalExpire: () => void;
  onQuestionExpire: () => void;
}): TimerState {
  const {
    startedAt,
    durationMinutes,
    perQuestionTimeSeconds,
    currentIndex,
  } = useExamStore();

  const [globalSeconds, setGlobalSeconds] = useState(0);
  const [questionSeconds, setQuestionSeconds] = useState(0);
  const globalExpiredRef = useRef(false);
  const questionExpiredRef = useRef(false);

  // Calculate initial global seconds
  useEffect(() => {
    if (!startedAt || !durationMinutes) return;
    const start = new Date(startedAt).getTime();
    const endMs = start + durationMinutes * 60 * 1000;
    const remaining = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
    setGlobalSeconds(remaining);
    globalExpiredRef.current = false;
  }, [startedAt, durationMinutes]);

  // Global countdown
  useEffect(() => {
    if (globalSeconds <= 0) return;
    const t = setInterval(() => {
      setGlobalSeconds((s) => {
        const next = s - 1;
        if (next <= 0) {
          clearInterval(t);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [globalSeconds > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fire global expire once
  useEffect(() => {
    if (globalSeconds <= 0 && !globalExpiredRef.current && startedAt) {
      globalExpiredRef.current = true;
      opts.onGlobalExpire();
    }
  }, [globalSeconds, startedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset question timer on index change
  useEffect(() => {
    if (perQuestionTimeSeconds > 0) {
      setQuestionSeconds(perQuestionTimeSeconds);
      questionExpiredRef.current = false;
    } else {
      setQuestionSeconds(0);
    }
  }, [currentIndex, perQuestionTimeSeconds]);

  // Question countdown
  useEffect(() => {
    if (questionSeconds <= 0 || perQuestionTimeSeconds <= 0) return;
    const t = setInterval(() => {
      setQuestionSeconds((s) => {
        const next = s - 1;
        if (next <= 0) {
          clearInterval(t);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [questionSeconds > 0, perQuestionTimeSeconds]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fire question expire once
  useEffect(() => {
    if (
      questionSeconds <= 0 &&
      perQuestionTimeSeconds > 0 &&
      !questionExpiredRef.current &&
      startedAt
    ) {
      questionExpiredRef.current = true;
      opts.onQuestionExpire();
    }
  }, [questionSeconds, perQuestionTimeSeconds, startedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    globalSeconds,
    questionSeconds,
    globalDisplay: formatTime(globalSeconds),
    questionDisplay: perQuestionTimeSeconds > 0 ? formatTime(questionSeconds) : "",
    globalWarning: globalSeconds > 0 && globalSeconds <= WARNING_THRESHOLD,
    questionWarning: questionSeconds > 0 && questionSeconds <= 10,
    globalExpired: globalSeconds <= 0 && !!startedAt,
    questionExpired: questionSeconds <= 0 && perQuestionTimeSeconds > 0 && !!startedAt,
  };
}
