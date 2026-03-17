"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const ADMIN_PATHS = ["/admin", "/access"];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuth = useAuthStore((s) => s.isAuthenticated());
  const role = useAuthStore((s) => s.role);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuth) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname || "/dashboard")}`);
      return;
    }
    // Block students from admin routes
    if (role === "STUDENT" && ADMIN_PATHS.some((p) => pathname?.startsWith(p))) {
      router.replace("/dashboard");
    }
  }, [isHydrated, isAuth, role, router, pathname]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuth) {
    return null;
  }

  return <>{children}</>;
}
