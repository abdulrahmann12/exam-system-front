"use client";

import { cn } from "@/lib/utils";
import { useExamStore, type QuestionStatus } from "@/store/examStore";

const statusStyles: Record<QuestionStatus, string> = {
  "not-visited":
    "bg-muted text-muted-foreground border-border hover:bg-accent",
  current:
    "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25",
  answered:
    "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
  flagged:
    "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700",
};

interface QuestionGridProps {
  className?: string;
}

export function QuestionGrid({ className }: QuestionGridProps) {
  const questions = useExamStore((s) => s.questions);
  const getStatus = useExamStore((s) => s.getStatus);
  const goTo = useExamStore((s) => s.goTo);
  const allowBack = useExamStore((s) => s.allowBackNavigation);
  const currentIndex = useExamStore((s) => s.currentIndex);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Questions
        </h2>
      </div>

      <div className="grid grid-cols-8 sm:grid-cols-5 gap-1 sm:gap-1.5">
        {questions.map((q, i) => {
          const status = getStatus(q.questionId, i);
          // Disable clicking previous questions if back-nav is forbidden
          const disabled = !allowBack && i < currentIndex;

          return (
            <button
              key={q.questionId}
              type="button"
              disabled={disabled}
              onClick={() => goTo(i)}
              className={cn(
                "relative w-full aspect-square rounded-lg border text-xs font-semibold",
                "transition-all duration-150 flex items-center justify-center",
                statusStyles[status],
                disabled && "opacity-40 cursor-not-allowed"
              )}
              title={`Question ${i + 1} — ${status.replace("-", " ")}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground pt-1">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-muted border border-border" />
          Not visited
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-primary" />
          Current
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-400 dark:bg-emerald-600" />
          Answered
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-orange-400 dark:bg-orange-600" />
          Flagged
        </span>
      </div>
    </div>
  );
}
