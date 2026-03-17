"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

import { collegeService } from "@/services/collegeService";
import { collegeSchema, type CollegeFormValues } from "@/schemas";
import { mapServerError } from "@/lib/formErrors";
import type { College } from "@/types/college";

import { Gate } from "@/components/Gate";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormField, inputClass } from "@/components/ui/FormField";

export default function CollegesPage() {
  // ── State ─────────────────────────────────────────────
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [keyword, setKeyword] = useState("");
  const pageSize = 10;

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<College | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<College | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ─────────────────────────────────────────────
  const fetchColleges = useCallback(async () => {
    setLoading(true);
    try {
      const res = keyword.trim()
        ? await collegeService.search({ keyword: keyword.trim(), page: page - 1, size: pageSize })
        : await collegeService.getAll({ page: page - 1, size: pageSize });
      const data = res.data?.data;
      setColleges(data?.content ?? []);
      setTotalItems(data?.totalElements ?? 0);
    } catch {
      toast.error("Failed to load colleges");
    } finally {
      setLoading(false);
    }
  }, [page, keyword]);

  useEffect(() => { void fetchColleges(); }, [fetchColleges]);

  // ── Form ──────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CollegeFormValues>({
    resolver: zodResolver(collegeSchema),
  });

  const openCreate = () => {
    setEditing(null);
    reset({ collegeName: "" });
    setDialogOpen(true);
  };

  const openEdit = (college: College) => {
    setEditing(college);
    reset({ collegeName: college.collegeName });
    setDialogOpen(true);
  };

  const onSubmit = async (values: CollegeFormValues) => {
    try {
      if (editing) {
        await collegeService.update(editing.collegeId, values);
        toast.success("College updated");
      } else {
        await collegeService.create(values);
        toast.success("College created");
      }
      setDialogOpen(false);
      void fetchColleges();
    } catch (err) {
      if (!mapServerError(err, setError)) {
        toast.error(err instanceof Error ? err.message : "Operation failed");
      }
    }
  };

  // ── Delete ────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await collegeService.delete(deleteTarget.collegeId);
      toast.success("College deleted");
      setDeleteTarget(null);
      void fetchColleges();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  // ── Search ────────────────────────────────────────────
  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void fetchColleges();
  };

  // ── Columns ───────────────────────────────────────────
  const columns: Column<College>[] = [
    { key: "collegeId", header: "ID", className: "w-20" },
    { key: "collegeName", header: "College Name" },
    {
      key: "actions",
      header: "Actions",
      className: "w-32 text-right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Gate permission="COLLEGE_UPDATE">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); openEdit(row); }}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </Gate>
          <Gate permission="COLLEGE_DELETE">
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

  // ── Render ────────────────────────────────────────────
  return (
    <Gate permission="COLLEGE_READ" fallback={<p className="text-muted-foreground p-8">Access denied.</p>}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">Colleges</h1>
          <Gate permission="COLLEGE_CREATE">
            <Button onClick={openCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add College
            </Button>
          </Gate>
        </div>

        {/* Search */}
        <form onSubmit={onSearch} className="flex gap-2 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search colleges..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className={`${inputClass} pl-9`}
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">Search</Button>
        </form>

        {/* Table */}
        <DataTable
          columns={columns}
          data={colleges}
          rowKey={(r) => r.collegeId}
          loading={loading}
          totalItems={totalItems}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          emptyMessage="No colleges found."
        />

        {/* Create / Edit Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title={editing ? "Edit College" : "Add College"}
          description={editing ? "Update the college name." : "Enter the name for the new college."}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="College Name" error={errors.collegeName?.message}>
              <input
                {...register("collegeName")}
                className={inputClass}
                placeholder="e.g. Faculty of Engineering"
                autoFocus
              />
            </FormField>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setDialogOpen(false)} type="button">
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete College"
          description={`Are you sure you want to delete "${deleteTarget?.collegeName}"? This action cannot be undone.`}
          loading={deleting}
        />
      </div>
    </Gate>
  );
}
