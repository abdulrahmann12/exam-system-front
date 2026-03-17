"use client";

import { useAuthStore } from "@/store/authStore";

/**
 * Hook for checking permissions extracted from the JWT.
 *
 * Usage:
 *   const { hasPermission, hasAny, hasAll, role } = usePermissions();
 *   if (hasPermission("EXAM_CREATE")) { ... }
 */
export function usePermissions() {
  const permissions = useAuthStore((s) => s.permissions);
  const role = useAuthStore((s) => s.role);

  const hasPermission = (permission: string): boolean =>
    permissions.includes(permission);

  const hasAny = (...perms: string[]): boolean =>
    perms.some((p) => permissions.includes(p));

  const hasAll = (...perms: string[]): boolean =>
    perms.every((p) => permissions.includes(p));

  return { permissions, role, hasPermission, hasAny, hasAll };
}
