"use client";

import { useEffect, useState, useCallback } from "react";
import { Pencil, Search, UserCheck, UserX, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { studentService } from "@/services/studentService";
import type { StudentProfile } from "@/types/student";

import { Gate } from "@/components/Gate";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormField, inputClass } from "@/components/ui/FormField";

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [keyword, setKeyword] = useState("");
  const pageSize = 10;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editYear, setEditYear] = useState(1);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<StudentProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ─────────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = keyword.trim()
        ? await studentService.search({ studentCode: keyword.trim(), page: page - 1, size: pageSize })
        : await studentService.getAll({ page: page - 1, size: pageSize });
      const raw = res.data?.data;
      // API might return array or page
      if (Array.isArray(raw)) {
        setStudents(raw);
        setTotalItems(raw.length);
      } else {
        setStudents(raw?.content ?? []);
        setTotalItems(raw?.totalElements ?? 0);
      }
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [page, keyword]);

  useEffect(() => { void fetchStudents(); }, [fetchStudents]);

  // ── Edit ──────────────────────────────────────────────
  const openEdit = (s: StudentProfile) => {
    setEditingStudent(s);
    setEditCode(s.studentCode);
    setEditYear(s.academicYear);
    setDialogOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setSaving(true);
    try {
      await studentService.update(editingStudent.studentId, {
        studentCode: editCode,
        academicYear: editYear,
      });
      toast.success("Student updated");
      setDialogOpen(false);
      void fetchStudents();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (s: StudentProfile) => {
    try {
      if (s.isActive) {
        await studentService.deactivate(s.studentId);
        toast.success(`${s.studentCode} deactivated`);
      } else {
        await studentService.activate(s.studentId);
        toast.success(`${s.studentCode} activated`);
      }
      void fetchStudents();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await studentService.delete(deleteTarget.studentId);
      toast.success("Student deleted");
      setDeleteTarget(null);
      void fetchStudents();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void fetchStudents();
  };

  // ── Columns ───────────────────────────────────────────
  const columns: Column<StudentProfile>[] = [
    { key: "studentId", header: "ID", className: "w-16" },
    {
      key: "student",
      header: "Student",
      render: (row) => (
        <div>
          <p className="font-medium">{row.firstName} {row.lastName}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    { key: "studentCode", header: "Code", className: "w-28" },
    {
      key: "academicYear",
      header: "Year",
      className: "w-20",
      render: (row) => <span className="text-muted-foreground">Year {row.academicYear}</span>,
    },
    {
      key: "collegeName",
      header: "College",
      render: (row) => <span className="text-muted-foreground text-xs">{row.collegeName ?? "—"}</span>,
    },
    {
      key: "departmentName",
      header: "Department",
      render: (row) => <span className="text-muted-foreground text-xs">{row.departmentName ?? "—"}</span>,
    },
    {
      key: "isActive",
      header: "Status",
      className: "w-24",
      render: (row) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          row.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        }`}>
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-32 text-right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); openEdit(row); }}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); void toggleActive(row); }}
            className={`rounded-lg p-1.5 transition-colors ${
              row.isActive
                ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                : "text-muted-foreground hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-900/30"
            }`}
            title={row.isActive ? "Deactivate" : "Activate"}
          >
            {row.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Gate permission="USER_READ" fallback={<p className="text-muted-foreground p-8">Access denied.</p>}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
        </div>

        <form onSubmit={onSearch} className="flex gap-2 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by student code..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className={`${inputClass} pl-9`}
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">Search</Button>
        </form>

        <DataTable
          columns={columns}
          data={students}
          rowKey={(r) => r.studentId}
          loading={loading}
          totalItems={totalItems}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          emptyMessage="No students found."
        />

        {/* Edit Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title={`Edit Student: ${editingStudent?.firstName ?? ""} ${editingStudent?.lastName ?? ""}`}
          description="Update student code and academic year."
        >
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField label="Student Code">
              <input
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
                className={inputClass}
                required
              />
            </FormField>
            <FormField label="Academic Year">
              <input
                type="number"
                min={1}
                max={7}
                value={editYear}
                onChange={(e) => setEditYear(Number(e.target.value))}
                className={inputClass}
                required
              />
            </FormField>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setDialogOpen(false)} type="button">Cancel</Button>
              <Button type="submit" loading={saving}>Update</Button>
            </div>
          </form>
        </Dialog>

        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Student"
          description={`Are you sure you want to delete student "${deleteTarget?.studentCode}"? This action cannot be undone.`}
          loading={deleting}
        />
      </div>
    </Gate>
  );
}
