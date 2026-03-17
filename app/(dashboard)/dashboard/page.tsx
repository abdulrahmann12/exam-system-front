"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  Activity,
  CheckCircle,
  TrendingUp,
  Clock,
  BarChart3,
  GraduationCap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useAcademicCascade } from "@/hooks/useAcademicCascade";
import { sessionService } from "@/services/sessionService";

import { Gate } from "@/components/Gate";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { selectClass } from "@/components/ui/FormField";

import type { AdminDashboardStats, StudentDashboardStats, StudentExamSessionSummary } from "@/types/session";
import type { LucideIcon } from "lucide-react";

// ── Stat Card ───────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  loading,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2.5 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground truncate">{label}</p>
          {loading ? (
            <Skeleton className="h-7 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-card-foreground">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Chart Colors ────────────────────────────────────────────

const CHART_COLORS = [
  "hsl(243, 75%, 59%)",   // primary/indigo
  "hsl(173, 58%, 39%)",   // teal
  "hsl(0, 84%, 60%)",     // red
  "hsl(43, 74%, 66%)",    // amber
  "hsl(197, 37%, 24%)",   // slate
];

const PIE_COLORS = ["hsl(152, 60%, 45%)", "hsl(0, 84%, 60%)"];

// ═══════════════════════════════════════════════════════════
//  Admin / Instructor Dashboard
// ═══════════════════════════════════════════════════════════

function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { colleges, departments, loadDepartments } = useAcademicCascade();
  const [collegeFilter, setCollegeFilter] = useState<number | undefined>();
  const [deptFilter, setDeptFilter] = useState<number | undefined>();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sessionService.getAdminStats({
        collegeId: collegeFilter,
        departmentId: deptFilter,
      });
      setStats(res.data?.data ?? null);
    } catch {
      // Stats endpoint may not be available yet — show empty
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [collegeFilter, deptFilter]);

  useEffect(() => { void fetchStats(); }, [fetchStats]);

  const passFailData = stats
    ? [
        { name: "Passed", value: stats.passRate },
        { name: "Failed", value: stats.failRate },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          className={`${selectClass} w-48`}
          value={collegeFilter ?? ""}
          onChange={(e) => {
            const v = Number(e.target.value) || undefined;
            setCollegeFilter(v);
            setDeptFilter(undefined);
            if (v) loadDepartments(v);
          }}
        >
          <option value="">All Colleges</option>
          {colleges.map((c) => (
            <option key={c.collegeId} value={c.collegeId}>{c.collegeName}</option>
          ))}
        </select>
        <select
          className={`${selectClass} w-48`}
          value={deptFilter ?? ""}
          onChange={(e) => setDeptFilter(Number(e.target.value) || undefined)}
          disabled={!collegeFilter}
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
          ))}
        </select>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Students" value={stats?.totalStudents ?? 0} color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" loading={loading} />
        <StatCard icon={FileText} label="Total Exams" value={stats?.totalExams ?? 0} color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" loading={loading} />
        <StatCard icon={Activity} label="Active Sessions" value={stats?.activeSessions ?? 0} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" loading={loading} />
        <StatCard icon={CheckCircle} label="Completed" value={stats?.completedSessions ?? 0} color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" loading={loading} />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Results Distribution Bar Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-card-foreground">Results Distribution</h3>
          </div>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : stats?.resultDistribution && stats.resultDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.resultDistribution} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {stats.resultDistribution.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available yet
            </div>
          )}
        </div>

        {/* Pass/Fail Pie Chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-card-foreground">Pass / Fail Rate</h3>
          </div>
          {loading ? (
            <Skeleton className="h-52 w-full" />
          ) : stats && (stats.passRate > 0 || stats.failRate > 0) ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={passFailData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {passFailData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                      fontSize: 13,
                    }}
                    formatter={(value) => `${Number(value).toFixed(1)}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 text-sm mt-2">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[0] }} />
                  Passed {stats.passRate.toFixed(1)}%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[1] }} />
                  Failed {stats.failRate.toFixed(1)}%
                </span>
              </div>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-muted-foreground">
              No data available yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="font-semibold text-card-foreground mb-4">Recent Exams</h3>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : stats?.recentExams && stats.recentExams.length > 0 ? (
          <div className="divide-y divide-border">
            {stats.recentExams.map((exam) => (
              <div key={exam.examId} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/exams/${exam.examId}`}
                    className="font-medium text-foreground hover:text-primary transition-colors truncate block"
                  >
                    {exam.title}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {exam.totalQuestions} questions · {new Date(exam.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Link href={`/exams/${exam.examId}`}>
                  <Button variant="ghost" size="sm">View</Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground py-6 text-center">No recent exams</p>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  Student Dashboard
// ═══════════════════════════════════════════════════════════

function StudentDashboard() {
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [sessions, setSessions] = useState<StudentExamSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, sessionsRes] = await Promise.all([
          sessionService.getStudentStats().catch(() => ({ data: { data: null } })),
          sessionService.getMyExams().catch(() => ({ data: { data: [] } })),
        ]);
        setStats(statsRes.data?.data ?? null);
        const sData = sessionsRes.data?.data;
        setSessions(Array.isArray(sData) ? sData : []);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={FileText} label="Exams Taken" value={stats?.examsTaken ?? 0} color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" loading={loading} />
        <StatCard icon={TrendingUp} label="Average Score" value={stats ? `${stats.averageScore.toFixed(1)}%` : "—"} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" loading={loading} />
        <StatCard icon={Activity} label="Active Sessions" value={sessions.filter((s) => s.isActive).length} color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" loading={loading} />
      </div>

      {/* Upcoming Exams */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-card-foreground">Upcoming Exams</h3>
        </div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : stats?.upcomingExams && stats.upcomingExams.length > 0 ? (
          <div className="divide-y divide-border">
            {stats.upcomingExams.map((exam) => (
              <div key={exam.examId} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium text-foreground">{exam.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(exam.startTime).toLocaleString()} · {exam.durationMinutes} min
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-0.5 text-xs font-medium">
                  Upcoming
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground py-6 text-center">No upcoming exams</p>
        )}
      </div>

      {/* Recent Sessions */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-card-foreground">Recent Sessions</h3>
          </div>
          <Link href="/my-sessions">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : sessions.length > 0 ? (
          <div className="divide-y divide-border">
            {sessions.slice(0, 5).map((s) => (
              <div key={s.sessionId} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{s.examTitle}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(s.startedAt).toLocaleDateString()}
                  </p>
                </div>
                {s.isActive ? (
                  <Link href={`/exam/${s.sessionId}`}>
                    <Button size="sm" variant="outline">Continue</Button>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    {s.totalMark != null && s.maxMark != null && (
                      <span className={`text-sm font-medium ${
                        s.maxMark > 0 && (s.totalMark / s.maxMark) >= 0.5
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}>
                        {s.totalMark}/{s.maxMark}
                      </span>
                    )}
                    <Link href={`/my-sessions/${s.sessionId}`}>
                      <Button size="sm" variant="ghost">Results</Button>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground py-6 text-center">No sessions yet</p>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  Main Dashboard
// ═══════════════════════════════════════════════════════════

export default function DashboardPage() {
  const { user } = useAuth();
  const { hasAny, role } = usePermissions();
  // Only show admin dashboard if role is NOT student AND has admin-level permissions
  const isAdmin = role !== "STUDENT" && hasAny("EXAM_CREATE", "USER_READ", "ROLE_READ");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.firstName ?? user?.username ?? "User"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAdmin
            ? "Monitor your exams and manage the platform"
            : "Track your exams and view your results"}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {isAdmin ? (
          <>
            <Link href="/exams/new">
              <Button size="sm"><FileText className="h-4 w-4 mr-2" /> Create Exam</Button>
            </Link>
            <Link href="/exams">
              <Button size="sm" variant="outline">My Exams</Button>
            </Link>
            <Gate permission="USER_READ">
              <Link href="/admin/users">
                <Button size="sm" variant="ghost">Manage Users</Button>
              </Link>
            </Gate>
          </>
        ) : (
          <>
            <Link href="/access">
              <Button size="sm">Enter Exam (QR)</Button>
            </Link>
            <Link href="/my-sessions">
              <Button size="sm" variant="outline">My Sessions</Button>
            </Link>
          </>
        )}
      </div>

      {isAdmin ? <AdminDashboard /> : <StudentDashboard />}
    </div>
  );
}
