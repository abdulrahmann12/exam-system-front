"use client";

import { cn } from "@/lib/utils";
import { useExamStore } from "@/store/examStore";

interface ExamTopBarProps {
  globalDisplay: string;
  questionDisplay: string;
  globalWarning: boolean;
  questionWarning: boolean;
  onFinish: () => void;
}

export function ExamTopBar({
  globalDisplay,
  questionDisplay,
  globalWarning,
  questionWarning,
  onFinish,
}: ExamTopBarProps) {
  const examTitle = useExamStore((s) => s.examTitle);
  const progress = useExamStore((s) => s.progress());
  const questions = useExamStore((s) => s.questions);
  const answers = useExamStore((s) => s.answers);

  return (
    <header className="sticky top-0 z-40 border-b border-border glass">
      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 h-12 sm:h-14">
        {/* Left: Title + answered count */}
        <div className="min-w-0 flex-1">
          <h1 className="text-xs sm:text-sm font-semibold text-foreground truncate">
            {examTitle}
          </h1>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {Object.keys(answers).length}/{questions.length} answered
          </p>
        </div>

        {/* Center: Timers */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Global timer */}
          <span
            className={cn(
              "font-mono text-xs sm:text-sm font-semibold tabular-nums px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg",
              globalWarning
                ? "bg-destructive/10 text-destructive animate-pulse"
                : "bg-muted text-foreground"
            )}
          >
            {globalDisplay}
          </span>

          {/* Per-question timer */}
          {questionDisplay && (
            <span
              className={cn(
                "font-mono text-[10px] sm:text-xs font-medium tabular-nums px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md",
                questionWarning
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 animate-pulse"
                  : "bg-muted/60 text-muted-foreground"
              )}
            >
              Q: {questionDisplay}
            </span>
          )}
        </div>

        {/* Right: Finish button */}
        <button
          onClick={onFinish}
          className={cn(
            "shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors",
            "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          <span className="hidden sm:inline">Finish Exam</span>
          <span className="sm:hidden">Finish</span>
        </button>
      </div>
    </header>
  );
}
