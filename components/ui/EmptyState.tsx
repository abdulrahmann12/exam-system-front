"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  FileText,
  ClipboardList,
  Users,
  Building2,
  BookOpen,
  Shield,
  Search,
  GraduationCap,
  BarChart3,
  Inbox,
} from "lucide-react";

// ── Preset Illustrations ────────────────────────────────────

const presets = {
  exams: { icon: FileText, title: "No exams yet", description: "Create your first exam to get started." },
  sessions: { icon: ClipboardList, title: "No sessions yet", description: "Start an exam by scanning a QR code or using an access link." },
  users: { icon: Users, title: "No users found", description: "Users will appear here once they register." },
  students: { icon: GraduationCap, title: "No students found", description: "Students will appear here once enrolled." },
  colleges: { icon: Building2, title: "No colleges yet", description: "Add your first college to build the academic hierarchy." },
  departments: { icon: BookOpen, title: "No departments yet", description: "Create departments under your colleges." },
  subjects: { icon: BookOpen, title: "No subjects yet", description: "Add subjects to organize your exams." },
  roles: { icon: Shield, title: "No roles yet", description: "Create roles to manage user permissions." },
  search: { icon: Search, title: "No results found", description: "Try adjusting your search or filters." },
  results: { icon: BarChart3, title: "No results yet", description: "Results will appear after exams are completed." },
  default: { icon: Inbox, title: "Nothing here yet", description: "Data will appear here when available." },
} as const;

export type EmptyStatePreset = keyof typeof presets;

// ── Component ───────────────────────────────────────────────

interface EmptyStateProps {
  /** Use a named preset for icon + text */
  preset?: EmptyStatePreset;
  /** Override icon */
  icon?: LucideIcon;
  /** Override title */
  title?: string;
  /** Override description */
  description?: string;
  /** Optional action (e.g. a Button) */
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  preset = "default",
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  const p = presets[preset];
  const Icon = icon ?? p.icon;
  const heading = title ?? p.title;
  const desc = description ?? p.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
    >
      {/* Animated icon ring */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring" as const, stiffness: 200, damping: 15, delay: 0.1 }}
        className="relative mb-5"
      >
        <div className="absolute inset-0 rounded-full bg-primary/5 blur-xl scale-150" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-muted/80 border border-border">
          <Icon className="h-9 w-9 text-muted-foreground/60" strokeWidth={1.5} />
        </div>
      </motion.div>

      <h3 className="text-lg font-semibold text-foreground mb-1.5">{heading}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{desc}</p>

      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
