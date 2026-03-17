"use client";

import { usePermissions } from "@/hooks/usePermissions";

interface GateProps {
  /** Single permission required */
  permission?: string;
  /** Any of these permissions grants access */
  any?: string[];
  /** All of these permissions required */
  all?: string[];
  /** What to render when access is denied (defaults to nothing) */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Declarative RBAC gate for conditional rendering.
 *
 * Usage:
 *   <Gate permission="EXAM_CREATE">
 *     <CreateExamButton />
 *   </Gate>
 *
 *   <Gate any={["USER_READ", "USER_UPDATE"]} fallback={<NoAccess />}>
 *     <UserTable />
 *   </Gate>
 */
export function Gate({ permission, any, all, fallback = null, children }: GateProps) {
  const { hasPermission, hasAny, hasAll } = usePermissions();

  let allowed = false;

  if (permission) {
    allowed = hasPermission(permission);
  } else if (any && any.length > 0) {
    allowed = hasAny(...any);
  } else if (all && all.length > 0) {
    allowed = hasAll(...all);
  } else {
    // No constraint specified → allow
    allowed = true;
  }

  return allowed ? <>{children}</> : <>{fallback}</>;
}
