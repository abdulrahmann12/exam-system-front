"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, CheckCircle2, Play, Eye, Search } from "lucide-react";
import { sessionService } from "@/services/sessionService";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { StudentExamSessionSummary } from "@/types/session";

export default function MySessionsPage() {
  const [sessions, setSessions] = useState<StudentExamSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    sessionService
      .getMyExams()
      .then((res) => {
        const data = res.data?.data;
        setSessions(Array.isArray(data) ? data : []);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = sessions.filter((s) =>
    s.examTitle.toLowerCase().includes(search.toLowerCase()),
  );

  const active = filtered.filter((s) => s.isActive);
  const completed = filtered.filter((s) => !s.isActive);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Sessions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {sessions.length} total · {active.length} active
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by exam title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            preset={search ? "search" : "sessions"}
            action={
              !search ? (
                <Link href="/access">
                  <Button size="sm">Enter Exam</Button>
                </Link>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Sessions */}
          {active.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Active Sessions
              </h2>
              <div className="space-y-2">
                {active.map((s) => (
                  <SessionRow key={s.sessionId} session={s} />
                ))}
              </div>
            </section>
          )}

          {/* Completed Sessions */}
          {completed.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Completed
              </h2>
              <div className="space-y-2">
                {completed.map((s) => (
                  <SessionRow key={s.sessionId} session={s} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

// ── Session Row ─────────────────────────────────────────────

function SessionRow({ session: s }: { session: StudentExamSessionSummary }) {
  const pct =
    s.totalMark != null && s.maxMark != null && s.maxMark > 0
      ? (s.totalMark / s.maxMark) * 100
      : null;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm transition-colors hover:bg-accent/40">
      {/* Status icon */}
      <div
        className={`flex-shrink-0 rounded-full p-2 ${
          s.isActive
            ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
            : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        }`}
      >
        {s.isActive ? <Play className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="font-medium text-card-foreground truncate">{s.examTitle}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-1">
          <span>{new Date(s.startedAt).toLocaleString()}</span>
          {s.endedAt && (
            <span>
              Duration: {Math.round((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60000)} min
            </span>
          )}
        </div>
      </div>

      {/* Score + Action */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {pct !== null && (
          <span
            className={`text-sm font-semibold ${
              pct >= 50
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {s.totalMark}/{s.maxMark}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              ({pct.toFixed(0)}%)
            </span>
          </span>
        )}

        {s.isActive ? (
          <Link href={`/exam/${s.sessionId}`}>
            <Button size="sm">
              <Play className="h-3.5 w-3.5 mr-1.5" /> Continue
            </Button>
          </Link>
        ) : (
          <Link href={`/my-sessions/${s.sessionId}`}>
            <Button size="sm" variant="outline">
              <Eye className="h-3.5 w-3.5 mr-1.5" /> Results
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
