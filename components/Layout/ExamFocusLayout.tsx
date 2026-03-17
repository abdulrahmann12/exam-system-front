"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamFocusLayoutProps {
  /** 0-100 — overall progress through the exam */
  progress?: number;
  /** Formatted time left string, e.g. "14:32" */
  timeLeft?: string;
  /** Show warning styling when time is low */
  timeWarning?: boolean;
  /** Called when the user clicks "Quit" — parent should confirm first */
  onQuit?: () => void;
  children: React.ReactNode;
}

/**
 * Minimal fullscreen layout for the exam engine.
 * No sidebar, no footer — just a slim top bar with progress + timer + quit.
 */
export function ExamFocusLayout({
  progress = 0,
  timeLeft,
  timeWarning = false,
  onQuit,
  children,
}: ExamFocusLayoutProps) {
  const router = useRouter();

  const handleQuit = () => {
    if (onQuit) {
      onQuit();
    } else {
      router.push("/my-sessions");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Slim top bar */}
      <header className="sticky top-0 z-30 h-12 flex items-center gap-3 px-4 border-b border-border glass">
        {/* Progress bar */}
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>

        {/* Timer */}
        {timeLeft && (
          <span
            className={cn(
              "text-sm font-mono font-semibold tabular-nums px-3 py-1 rounded-lg",
              timeWarning
                ? "bg-destructive/10 text-destructive animate-pulse"
                : "bg-muted text-muted-foreground"
            )}
          >
            {timeLeft}
          </span>
        )}

        {/* Quit button */}
        <button
          onClick={handleQuit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <X className="h-4 w-4" />
          <span className="hidden sm:inline">Quit</span>
        </button>
      </header>

      {/* Exam content — full viewport */}
      <main className="flex-1 px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}
