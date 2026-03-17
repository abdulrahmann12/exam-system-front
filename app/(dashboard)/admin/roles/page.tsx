"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";

import { roleService } from "@/services/roleService";
import { permissionService } from "@/services/permissionService";
import { roleSchema, type RoleFormValues } from "@/schemas";
import { mapServerError } from "@/lib/formErrors";
import type { Role } from "@/types/role";
import type { Permission } from "@/types/permission";

import { Gate } from "@/components/Gate";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormField, inputClass } from "@/components/ui/FormField";

// Group permissions by module
function groupByModule(permissions: Permission[]) {
  const groups: Record<string, Permission[]> = {};
  for (const p of permissions) {
    const module = p.module ?? p.code.split("_")[0] ?? "Other";
    if (!groups[module]) groups[module] = [];
    groups[module].push(p);
  }
  return groups;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // ── Fetch ─────────────────────────────────────────────
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await roleService.getAll({ page: page - 1, size: pageSize });
      const data = res.data?.data;
      setRoles(data?.content ?? []);
      setTotalItems(data?.totalElements ?? 0);
    } catch {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { void fetchRoles(); }, [fetchRoles]);

  useEffect(() => {
    permissionService.getAll({ page: 0, size: 500 })
      .then((res) => setAllPermissions(res.data?.data?.content ?? []))
      .catch(() => {});
  }, []);

  // ── Form ──────────────────────────────────────────────
  const { register, handleSubmit, reset, setError, control, formState: { errors, isSubmitting } } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
  });

  const openCreate = () => {
    setEditing(null);
    reset({ roleName: "", permissionIds: [] });
    setExpandedModules(new Set());
    setDialogOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditing(role);
    const ids = role.permissions?.map((p) => p.permissionId) ?? role.permissionIds ?? [];
    reset({ roleName: role.roleName, permissionIds: ids });
    setExpandedModules(new Set());
    setDialogOpen(true);
  };

  const onSubmit = async (values: RoleFormValues) => {
    try {
      if (editing) {
        await roleService.update(editing.roleId, values);
        toast.success("Role updated");
      } else {
        await roleService.create(values);
        toast.success("Role created");
      }
      setDialogOpen(false);
      void fetchRoles();
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
      await roleService.delete(deleteTarget.roleId);
      toast.success("Role deleted");
      setDeleteTarget(null);
      void fetchRoles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const toggleModule = (mod: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(mod)) next.delete(mod); else next.add(mod);
      return next;
    });
  };

  const grouped = groupByModule(allPermissions);

  // ── Columns ───────────────────────────────────────────
  const columns: Column<Role>[] = [
    { key: "roleId", header: "ID", className: "w-16" },
    {
      key: "roleName",
      header: "Role",
      render: (row) => (
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
          {row.roleName}
        </span>
      ),
    },
    {
      key: "permissions",
      header: "Permissions",
      render: (row) => {
        const count = row.permissions?.length ?? row.permissionIds?.length ?? 0;
        return <span className="text-muted-foreground">{count} permissions</span>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-32 text-right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Gate permission="ROLE_UPDATE">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); openEdit(row); }}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </Gate>
          <Gate permission="ROLE_DELETE">
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
    <Gate permission="ROLE_READ" fallback={<p className="text-muted-foreground p-8">Access denied.</p>}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">Roles & Permissions</h1>
          <Gate permission="ROLE_CREATE">
            <Button onClick={openCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add Role
            </Button>
          </Gate>
        </div>

        <DataTable
          columns={columns}
          data={roles}
          rowKey={(r) => r.roleId}
          loading={loading}
          totalItems={totalItems}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          emptyMessage="No roles found."
        />

        {/* Create / Edit Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title={editing ? "Edit Role" : "Add Role"}
          className="max-w-2xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Role Name" error={errors.roleName?.message}>
              <input {...register("roleName")} className={inputClass} placeholder="e.g. Instructor" autoFocus />
            </FormField>

            <FormField label="Permissions" error={errors.permissionIds?.message}>
              <Controller
                control={control}
                name="permissionIds"
                render={({ field }) => (
                  <div className="max-h-64 overflow-y-auto rounded-lg border border-input bg-background p-2 space-y-1">
                    {Object.entries(grouped).map(([module, perms]) => (
                      <div key={module}>
                        <button
                          type="button"
                          onClick={() => toggleModule(module)}
                          className="flex items-center gap-1.5 w-full text-left text-sm font-medium text-foreground py-1.5 px-2 rounded-md hover:bg-accent transition-colors"
                        >
                          {expandedModules.has(module) ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          <span className="uppercase tracking-wide text-xs">{module}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {perms.filter((p) => field.value.includes(p.permissionId)).length}/{perms.length}
                          </span>
                        </button>
                        {expandedModules.has(module) && (
                          <div className="ml-5 space-y-0.5 pb-1">
                            {perms.map((p) => {
                              const checked = field.value.includes(p.permissionId);
                              return (
                                <label
                                  key={p.permissionId}
                                  className="flex items-center gap-2 text-sm cursor-pointer py-1 px-2 rounded-md hover:bg-muted/50 transition-colors"
                                >
                                  <div
                                    className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                                      checked ? "bg-primary border-primary" : "border-input"
                                    }`}
                                  >
                                    {checked && <Check className="h-3 w-3 text-primary-foreground" />}
                                  </div>
                                  <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={checked}
                                    onChange={(e) => {
                                      const next = e.target.checked
                                        ? [...field.value, p.permissionId]
                                        : field.value.filter((id) => id !== p.permissionId);
                                      field.onChange(next);
                                    }}
                                  />
                                  <span className="text-foreground">{p.code}</span>
                                  {p.description && (
                                    <span className="text-xs text-muted-foreground ml-auto">{p.description}</span>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              />
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
          title="Delete Role"
          description={`Are you sure you want to delete the "${deleteTarget?.roleName}" role? This action cannot be undone.`}
          loading={deleting}
        />
      </div>
    </Gate>
  );
}
