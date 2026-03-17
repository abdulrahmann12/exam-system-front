"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Search, UserCheck, UserX, Filter } from "lucide-react";
import { toast } from "sonner";

import { userService } from "@/services/userService";
import { roleService } from "@/services/roleService";
import { collegeService } from "@/services/collegeService";
import { departmentService } from "@/services/departmentService";
import { adminUserSchema, type AdminUserFormValues } from "@/schemas";
import { mapServerError } from "@/lib/formErrors";
import type { UserProfile } from "@/types/user";
import type { Role } from "@/types/role";
import type { College } from "@/types/college";
import type { Department } from "@/types/department";

import { Gate } from "@/components/Gate";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FormField, inputClass, selectClass } from "@/components/ui/FormField";

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [keyword, setKeyword] = useState("");
  const pageSize = 10;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // ── Fetch ─────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = keyword.trim()
        ? await userService.search({ keyword: keyword.trim(), page: page - 1, size: pageSize })
        : await userService.getAll({ page: page - 1, size: pageSize });
      const data = res.data?.data;
      setUsers(data?.content ?? []);
      setTotalItems(data?.totalElements ?? 0);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, keyword]);

  useEffect(() => { void fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    Promise.all([
      roleService.getAll({ page: 0, size: 100 }),
      collegeService.getAll({ page: 0, size: 200 }),
    ]).then(([rolesRes, collegesRes]) => {
      setRoles(rolesRes.data?.data?.content ?? []);
      setColleges(collegesRes.data?.data?.content ?? []);
    }).catch(() => {});
  }, []);

  // ── Form ──────────────────────────────────────────────
  const { register, handleSubmit, reset, setError, setValue, control, formState: { errors, isSubmitting } } = useForm<AdminUserFormValues>({
    resolver: zodResolver(adminUserSchema),
  });

  const selectedCollegeId = useWatch({ control, name: "collegeId" });

  useEffect(() => {
    if (!selectedCollegeId || selectedCollegeId <= 0) {
      setDepartments([]);
      return;
    }
    departmentService.getByCollege(selectedCollegeId)
      .then((res) => setDepartments(res.data?.data ?? []))
      .catch(() => setDepartments([]));
  }, [selectedCollegeId]);

  const openEdit = (user: UserProfile) => {
    setEditingUser(user);
    reset({
      roleId: user.roleId ?? 0,
      collegeId: user.collegeId,
      departmentId: user.departmentId,
      isActive: user.isActive,
    });
    if (user.collegeId) {
      departmentService.getByCollege(user.collegeId)
        .then((res) => setDepartments(res.data?.data ?? []))
        .catch(() => {});
    }
    setDialogOpen(true);
  };

  const onSubmit = async (values: AdminUserFormValues) => {
    if (!editingUser) return;
    try {
      await userService.updateUser(editingUser.userId, values);
      toast.success("User updated");
      setDialogOpen(false);
      void fetchUsers();
    } catch (err) {
      if (!mapServerError(err, setError)) {
        toast.error(err instanceof Error ? err.message : "Update failed");
      }
    }
  };

  const toggleActive = async (user: UserProfile) => {
    try {
      if (user.isActive) {
        await userService.deactivate(user.userId);
        toast.success(`${user.username} deactivated`);
      } else {
        await userService.activate(user.userId);
        toast.success(`${user.username} activated`);
      }
      void fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    }
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void fetchUsers();
  };

  // ── Columns ───────────────────────────────────────────
  const columns: Column<UserProfile>[] = [
    { key: "userId", header: "ID", className: "w-16" },
    {
      key: "username",
      header: "User",
      render: (row) => (
        <div>
          <p className="font-medium">{row.username}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (row) => `${row.firstName} ${row.lastName}`,
    },
    {
      key: "roleName",
      header: "Role",
      render: (row) => (
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {row.roleName ?? "—"}
        </span>
      ),
    },
    {
      key: "collegeName",
      header: "College",
      render: (row) => <span className="text-muted-foreground text-xs">{row.collegeName ?? "—"}</span>,
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
      className: "w-28 text-right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Gate permission="USER_UPDATE">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); openEdit(row); }}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </Gate>
          <Gate permission="USER_UPDATE">
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
          </Gate>
        </div>
      ),
    },
  ];

  return (
    <Gate permission="USER_READ" fallback={<p className="text-muted-foreground p-8">Access denied.</p>}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
        </div>

        <form onSubmit={onSearch} className="flex gap-2 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className={`${inputClass} pl-9`}
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">Search</Button>
        </form>

        <DataTable
          columns={columns}
          data={users}
          rowKey={(r) => r.userId}
          loading={loading}
          totalItems={totalItems}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          emptyMessage="No users found."
        />

        {/* Edit User Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title={`Edit User: ${editingUser?.username ?? ""}`}
          description="Update role, assignment, and status."
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Role" error={errors.roleId?.message}>
              <select {...register("roleId", { valueAsNumber: true })} className={selectClass}>
                <option value={0}>Select role</option>
                {roles.map((r) => (
                  <option key={r.roleId} value={r.roleId}>{r.roleName}</option>
                ))}
              </select>
            </FormField>
            <FormField label="College" error={errors.collegeId?.message}>
              <select
                {...register("collegeId", { valueAsNumber: true })}
                className={selectClass}
                onChange={(e) => {
                  const v = Number(e.target.value) || undefined;
                  setValue("collegeId", v);
                  setValue("departmentId", undefined);
                }}
              >
                <option value="">None</option>
                {colleges.map((c) => (
                  <option key={c.collegeId} value={c.collegeId}>{c.collegeName}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Department" error={errors.departmentId?.message}>
              <select {...register("departmentId", { valueAsNumber: true })} className={selectClass} disabled={!selectedCollegeId}>
                <option value="">None</option>
                {departments.map((d) => (
                  <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Status">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" {...register("isActive")} className="rounded border-input" />
                <span>Active</span>
              </label>
            </FormField>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setDialogOpen(false)} type="button">Cancel</Button>
              <Button type="submit" loading={isSubmitting}>Update</Button>
            </div>
          </form>
        </Dialog>
      </div>
    </Gate>
  );
}
