"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebarStore";
import { usePermissions } from "@/hooks/usePermissions";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** If set, the link only shows when the user has at least one of these permissions */
  permissions?: string[];
}

const navSections: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/exams", label: "Exams", icon: FileText, permissions: ["EXAM_READ"] },
      { href: "/my-sessions", label: "My Sessions", icon: ClipboardList },
      { href: "/profile", label: "Profile", icon: User },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/access", label: "Access Control", icon: ShieldCheck, permissions: ["ROLE_READ", "PERMISSION_READ"] },
      { href: "/admin/users", label: "Users", icon: Users, permissions: ["USER_READ"] },
      { href: "/admin/students", label: "Students", icon: UserRoundSearch, permissions: ["USER_READ"] },
      { href: "/admin/colleges", label: "Colleges", icon: Building2, permissions: ["COLLEGE_READ"] },
      { href: "/admin/departments", label: "Departments", icon: BookOpen, permissions: ["DEPARTMENT_READ"] },
      { href: "/admin/subjects", label: "Subjects", icon: GraduationCap, permissions: ["SUBJECT_READ"] },
      { href: "/admin/roles", label: "Roles", icon: Shield, permissions: ["ROLE_READ"] },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed } = useSidebarStore();
  const toggle = useSidebarStore((s) => s.toggle);
  const { hasAny, role } = usePermissions();

  const isStudent = role === "STUDENT";

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col fixed inset-y-0 left-0 z-30",
        "glass-sidebar transition-[width] duration-300 ease-in-out",
        isCollapsed ? "w-[68px]" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            E
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-lg font-bold text-sidebar-foreground whitespace-nowrap overflow-hidden"
              >
                Exam System
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {navSections.map((section, si) => {
          // Hide entire Administration section for students
          if (section.title === "Administration" && isStudent) return null;
          const visibleItems = section.items.filter(
            (item) => !item.permissions || hasAny(...item.permissions)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={si}>
              {section.title && !isCollapsed && (
                <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </p>
              )}
              {section.title && isCollapsed && (
                <div className="mx-auto mb-2 h-px w-8 bg-sidebar-border" />
              )}
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={isCollapsed ? item.label : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        <AnimatePresence mode="wait">
                          {!isCollapsed && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.15 }}
                              className="whitespace-nowrap overflow-hidden"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggle}
        className="flex items-center justify-center h-10 mx-2 mb-3 rounded-lg text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
      >
        {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>
    </aside>
  );
}
