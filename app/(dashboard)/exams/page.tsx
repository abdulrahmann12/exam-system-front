"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, QrCode, Search, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

import { examService } from "@/services/examService";
import type { ExamSummary } from "@/types/exam";

import { Gate } from "@/components/Gate";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { inputClass } from "@/components/ui/FormField";

export default function ExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [keyword, setKeyword] = useState("");
  const pageSize = 10;

  const [deleteTarget, setDeleteTarget] = useState<ExamSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const res = keyword.trim()
        ? await examService.search({ keyword: keyword.trim(), page: page - 1, size: pageSize })
        : await examService.getMyExams({ page: page - 1, size: pageSize });
      const data = res.data?.data;
      setExams(data?.content ?? []);
      setTotalItems(data?.totalElements ?? 0);
    } catch {
      toast.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  }, [page, keyword]);

  useEffect(() => { void fetchExams(); }, [fetchExams]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await examService.delete(deleteTarget.examId);
      toast.success("Exam deleted");
      setDeleteTarget(null);
      void fetchExams();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void fetchExams();
  };

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
    catch { return iso; }
  };

  const columns: Column<ExamSummary>[] = [
    {
      key: "title",
      header: "Exam",
      render: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {row.subjectName ?? "—"} · {row.totalQuestions} Q · {row.durationMinutes} min
          </p>
        </div>
      ),
    },
    {
      key: "schedule",
      header: "Schedule",
      render: (row) => (
        <div className="text-xs text-muted-foreground space-y-0.5">
          <p><Clock className="inline h-3 w-3 mr-1" />{formatDate(row.startTime)}</p>
          <p className="pl-4">→ {formatDate(row.endTime)}</p>
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      className: "w-24",
      render: (row) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
          row.isActive
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        }`}>
          {row.isActive ? <><CheckCircle className="h-3 w-3" /> Active</> : <><XCircle className="h-3 w-3" /> Inactive</>}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-40 text-right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); router.push(`/exams/${row.examId}`); }}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); router.push(`/exams/${row.examId}/qr`); }}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            title="QR Code"
          >
            <QrCode className="h-4 w-4" />
          </button>
          <Gate permission="EXAM_UPDATE">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); router.push(`/exams/${row.examId}/edit`); }}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </Gate>
          <Gate permission="EXAM_DELETE">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Gate>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Exams</h1>
        <Gate permission="EXAM_CREATE">
          <Link href="/exams/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" /> Create Exam
            </Button>
          </Link>
        </Gate>
      </div>

      <form onSubmit={onSearch} className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search exams..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className={`${inputClass} pl-9`}
          />
        </div>
        <Button type="submit" size="sm" variant="secondary">Search</Button>
      </form>

      <DataTable
        columns={columns}
        data={exams}
        rowKey={(r) => r.examId}
        loading={loading}
        totalItems={totalItems}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        emptyMessage="No exams found."
        onRowClick={(row) => router.push(`/exams/${row.examId}`)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Exam"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
