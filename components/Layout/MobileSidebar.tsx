"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebarStore";
import { usePermissions } from "@/hooks/usePermissions";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  User,
  Users,
  UserRoundSearch,
  Building2,
  BookOpen,
  Shield,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";

const navItems: { href: string; label: string; icon: LucideIcon; permissions?: string[] }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/exams", label: "Exams", icon: FileText, permissions: ["EXAM_READ"] },
  { href: "/my-sessions", label: "My Sessions", icon: ClipboardList },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/access", label: "Access Control", icon: ShieldCheck, permissions: ["ROLE_READ", "PERMISSION_READ"] },
  { href: "/admin/users", label: "Users", icon: Users, permissions: ["USER_READ"] },      { href: "/admin/students", label: "Students", icon: UserRoundSearch, permissions: ["USER_READ"] },  { href: "/admin/colleges", label: "Colleges", icon: Building2, permissions: ["COLLEGE_READ"] },
  { href: "/admin/departments", label: "Departments", icon: BookOpen, permissions: ["DEPARTMENT_READ"] },
  { href: "/admin/subjects", label: "Subjects", icon: GraduationCap, permissions: ["SUBJECT_READ"] },
  { href: "/admin/roles", label: "Roles", icon: Shield, permissions: ["ROLE_READ"] },
];

/** Backdrop overlay + slide-in drawer for mobile */
export function MobileSidebar() {
  const pathname = usePathname();
  const { isMobileOpen, setMobileOpen } = useSidebarStore();
  const { hasAny, role } = usePermissions();
  const isStudent = role === "STUDENT";

  // Filter out admin-only items for students
  const adminPaths = ["/access", "/admin/"];
  const visibleItems = navItems.filter((item) => {
    if (isStudent && adminPaths.some((p) => item.href.startsWith(p))) return false;
    return !item.permissions || hasAny(...item.permissions);
  });

  return (
    <AnimatePresence>
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-64 glass-sidebar md:hidden"
          >
            <div className="flex items-center justify-between h-14 px-4 border-b border-sidebar-border">
              <Link
                href="/dashboard"
                className="flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                  E
                </div>
                <span className="text-lg font-bold text-sidebar-foreground">
                  Exam System
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-sidebar-accent/50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-2">
              <ul className="space-y-1">
                {visibleItems
                  .map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/** Mobile hamburger trigger — shown in the Navbar on small screens */
export function MobileMenuButton() {
  const { setMobileOpen } = useSidebarStore();
  return (
    <button
      onClick={() => setMobileOpen(true)}
      className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
