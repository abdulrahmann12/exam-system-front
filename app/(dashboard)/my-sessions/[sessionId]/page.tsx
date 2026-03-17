"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { sessionService } from "@/services/sessionService";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import type { SessionResult, AnswerResult } from "@/types/session";

export default function SessionResultPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [result, setResult] = useState<SessionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    sessionService
      .getResult(Number(sessionId))
      .then((res) => setResult(res.data?.data ?? null))
      .catch(() => setError("Could not load results. The session may still be in progress."))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <ResultSkeleton />;

  if (error || !result) {
    return (
      <div className="space-y-4">
        <Link href="/my-sessions" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to sessions
        </Link>
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">{error ?? "Result not found"}</p>
        </div>
      </div>
    );
  }

  const pct = result.maxMark > 0 ? result.percentage : 0;
  const correct = result.answers.filter((a) => a.isCorrect).length;
  const wrong = result.answers.length - correct;
  const duration =
    result.startedAt && result.endedAt
      ? Math.round((new Date(result.endedAt).getTime() - new Date(result.startedAt).getTime()) / 60000)
      : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back */}
      <Link href="/my-sessions" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to sessions
      </Link>

      {/* Summary Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-bold text-card-foreground">{result.examTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">Session #{result.sessionCode}</p>

        <div className="grid gap-4 sm:grid-cols-4 mt-5">
          <MiniStat
            icon={Trophy}
            label="Score"
            value={`${result.totalMark}/${result.maxMark}`}
            color={result.passed ? "text-emerald-600" : "text-red-600"}
          />
          <MiniStat
            icon={FileText}
            label="Percentage"
            value={`${pct.toFixed(1)}%`}
            color={result.passed ? "text-emerald-600" : "text-red-600"}
          />
          <MiniStat
            icon={CheckCircle2}
            label="Correct"
            value={`${correct}/${result.answers.length}`}
            color="text-emerald-600"
          />
          <MiniStat
            icon={Clock}
            label="Duration"
            value={duration != null ? `${duration} min` : "—"}
            color="text-muted-foreground"
          />
        </div>

        {/* Pass / Fail badge */}
        <div className="mt-5 flex items-center gap-2">
          {result.passed ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" /> Passed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 text-sm font-medium">
              <XCircle className="h-4 w-4" /> Failed
            </span>
          )}
        </div>
      </div>

      {/* Questions Breakdown */}
      <div className="space-y-3">
        <h2 className="font-semibold text-foreground">Question Breakdown</h2>
        {result.answers.map((answer, idx) => (
          <AnswerCard key={answer.questionId} answer={answer} index={idx} />
        ))}
      </div>
    </div>
  );
}

// ── Mini Stat ───────────────────────────────────────────────

function MiniStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <Icon className={`h-5 w-5 mx-auto mb-1 ${color}`} />
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// ── Answer Card (expandable) ────────────────────────────────

function AnswerCard({ answer: a, index }: { answer: AnswerResult; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`rounded-xl border bg-card shadow-sm transition-colors ${
        a.isCorrect ? "border-emerald-200 dark:border-emerald-800/40" : "border-red-200 dark:border-red-800/40"
      }`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-3 text-left"
      >
        <span
          className={`flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold ${
            a.isCorrect
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {index + 1}
        </span>
        <span className="flex-1 text-sm text-card-foreground font-medium truncate">
          {a.questionText}
        </span>
        <span className="text-xs font-semibold text-muted-foreground flex-shrink-0">
          {a.earnedMarks}/{a.marks}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="px-5 pb-4 border-t border-border pt-3 space-y-2">
          {/* MCQ choices */}
          {a.choices && a.choices.length > 0 ? (
            <ul className="space-y-1.5">
              {a.choices.map((c) => {
                const isSelected = c.choiceId === a.selectedChoiceId;
                const isCorrect = c.choiceId === a.correctChoiceId;
                let style = "border-border bg-background text-foreground";
                if (isCorrect) style = "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300";
                else if (isSelected && !isCorrect) style = "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300";

                return (
                  <li
                    key={c.choiceId}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${style}`}
                  >
                    {isCorrect && <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />}
                    {isSelected && !isCorrect && <XCircle className="h-4 w-4 flex-shrink-0 text-red-600" />}
                    {!isCorrect && !isSelected && <span className="h-4 w-4 flex-shrink-0" />}
                    <span>{c.choiceText}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            /* Written answer */
            <div>
              <p className="text-xs text-muted-foreground mb-1">Your answer:</p>
              <p className="text-sm text-card-foreground bg-muted/50 rounded-lg px-3 py-2">
                {a.answerText || <span className="italic text-muted-foreground">No answer provided</span>}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Skeleton ────────────────────────────────────────────────

function ResultSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-52 w-full rounded-xl" />
      <Skeleton className="h-6 w-48" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
