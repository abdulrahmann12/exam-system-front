"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

import { departmentService } from "@/services/departmentService";
import { collegeService } from "@/services/collegeService";
import { departmentSchema, type DepartmentFormValues } from "@/schemas";
import { mapServerError } from "@/lib/formErrors";
import type { Department } from "@/types/department";
import type { College } from "@/types/college";

import { Gate } from "@/components/Gate";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormField, inputClass, selectClass } from "@/components/ui/FormField";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [keyword, setKeyword] = useState("");
  const pageSize = 10;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ─────────────────────────────────────────────
  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const res = keyword.trim()
        ? await departmentService.search({ keyword: keyword.trim(), page: page - 1, size: pageSize })
        : await departmentService.getAll({ page: page - 1, size: pageSize });
      const data = res.data?.data;
      setDepartments(data?.content ?? []);
      setTotalItems(data?.totalElements ?? 0);
    } catch {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  }, [page, keyword]);

  useEffect(() => { void fetchDepartments(); }, [fetchDepartments]);

  useEffect(() => {
    collegeService.getAll({ page: 0, size: 200 })
      .then((res) => setColleges(res.data?.data?.content ?? []))
      .catch(() => {});
  }, []);

  // ── Form ──────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
  });

  const openCreate = () => {
    setEditing(null);
    reset({ departmentName: "", collegeId: 0 });
    setDialogOpen(true);
  };

  const openEdit = (dept: Department) => {
    setEditing(dept);
    reset({ departmentName: dept.departmentName, collegeId: dept.collegeId ?? 0 });
    setDialogOpen(true);
  };

  const onSubmit = async (values: DepartmentFormValues) => {
    try {
      if (editing) {
        await departmentService.update(editing.departmentId, values);
        toast.success("Department updated");
      } else {
        await departmentService.create(values);
        toast.success("Department created");
      }
      setDialogOpen(false);
      void fetchDepartments();
    } catch (err) {
      if (!mapServerError(err, setError)) {
        toast.error(err instanceof Error ? err.message : "Operation failed");
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await departmentService.delete(deleteTarget.departmentId);
      toast.success("Department deleted");
      setDeleteTarget(null);
      void fetchDepartments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void fetchDepartments();
  };

  // ── Columns ───────────────────────────────────────────
  const columns: Column<Department>[] = [
    { key: "departmentId", header: "ID", className: "w-20" },
    { key: "departmentName", header: "Department Name" },
    {
      key: "collegeName",
      header: "College",
      render: (row) => <span className="text-muted-foreground">{row.collegeName ?? "—"}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-32 text-right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Gate permission="DEPARTMENT_UPDATE">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); openEdit(row); }}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </Gate>
          <Gate permission="DEPARTMENT_DELETE">
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
    <Gate permission="DEPARTMENT_READ" fallback={<p className="text-muted-foreground p-8">Access denied.</p>}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">Departments</h1>
          <Gate permission="DEPARTMENT_CREATE">
            <Button onClick={openCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add Department
            </Button>
          </Gate>
        </div>

        <form onSubmit={onSearch} className="flex gap-2 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search departments..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className={`${inputClass} pl-9`}
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">Search</Button>
        </form>

        <DataTable
          columns={columns}
          data={departments}
          rowKey={(r) => r.departmentId}
          loading={loading}
          totalItems={totalItems}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          emptyMessage="No departments found."
        />

        {/* Create / Edit Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title={editing ? "Edit Department" : "Add Department"}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Department Name" error={errors.departmentName?.message}>
              <input
                {...register("departmentName")}
                className={inputClass}
                placeholder="e.g. Computer Science"
                autoFocus
              />
            </FormField>
            <FormField label="College" error={errors.collegeId?.message}>
              <select {...register("collegeId", { valueAsNumber: true })} className={selectClass}>
                <option value={0}>Select college</option>
                {colleges.map((c) => (
                  <option key={c.collegeId} value={c.collegeId}>{c.collegeName}</option>
                ))}
              </select>
            </FormField>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setDialogOpen(false)} type="button">Cancel</Button>
              <Button type="submit" loading={isSubmitting}>{editing ? "Update" : "Create"}</Button>
            </div>
          </form>
        </Dialog>

        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Department"
          description={`Are you sure you want to delete "${deleteTarget?.departmentName}"? This action cannot be undone.`}
          loading={deleting}
        />
      </div>
    </Gate>
  );
}
