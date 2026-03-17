"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

// ── Types ───────────────────────────────────────────────────
export interface Column<T> {
  key: string;
  header: string;
  /** Render cell content. Falls back to `row[key]` as string. */
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  /** Total items on the server — enables server-side pagination */
  totalItems?: number;
  /** Current page (1-indexed) */
  page?: number;
  /** Items per page */
  pageSize?: number;
  onPageChange?: (page: number) => void;
  loading?: boolean;
  /** Number of skeleton rows shown while loading */
  skeletonRows?: number;
  /** Key extractor for each row */
  rowKey: (row: T, index: number) => string | number;
  /** Called when a row is clicked */
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  /** Optional render function for mobile card view (shown below md breakpoint) */
  mobileCard?: (row: T, index: number) => React.ReactNode;
}

const rowVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.2 },
  }),
};

export function DataTable<T>({
  columns,
  data,
  totalItems,
  page = 1,
  pageSize = 10,
  onPageChange,
  loading = false,
  skeletonRows = 5,
  rowKey,
  onRowClick,
  emptyMessage = "No data found.",
  mobileCard,
}: DataTableProps<T>) {
  const totalPages = totalItems != null ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1;
  const showPagination = onPageChange && totalItems != null && totalPages > 1;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      {/* ─── Mobile Card View ────────────────────────────── */}
      {mobileCard && (
        <div className="md:hidden">
          {loading ? (
            <div className="p-3 space-y-3">
              {Array.from({ length: skeletonRows }).map((_, i) => (
                <Skeleton key={`m-skel-${i}`} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="px-4 py-12 text-center text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.map((row, i) => (
                <motion.div
                  key={rowKey(row, i)}
                  custom={i}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className={onRowClick ? "cursor-pointer" : ""}
                  onClick={() => onRowClick?.(row)}
                >
                  {mobileCard(row, i)}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Table (hidden on mobile when mobileCard is provided) */}
      <div className={cn("overflow-x-auto", mobileCard && "hidden md:block")}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left font-semibold text-muted-foreground",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: skeletonRows }).map((_, r) => (
                  <tr key={`skel-${r}`} className="border-b border-border last:border-b-0">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : data.length === 0
              ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                )
              : data.map((row, i) => (
                  <motion.tr
                    key={rowKey(row, i)}
                    custom={i}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    className={cn(
                      "border-b border-border last:border-b-0 transition-colors",
                      onRowClick
                        ? "cursor-pointer hover:bg-accent/50"
                        : "hover:bg-muted/30"
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={cn("px-4 py-3", col.className)}>
                        {col.render
                          ? col.render(row, i)
                          : String((row as Record<string, unknown>)[col.key] ?? "")}
                      </td>
                    ))}
                  </motion.tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* ─── Pagination ──────────────────────────────────── */}
      {showPagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
            {totalItems != null && (
              <> &middot; {totalItems} total</>
            )}
          </p>
          <div className="flex items-center gap-1">
            <PaginationButton
              onClick={() => onPageChange!(1)}
              disabled={page <= 1}
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </PaginationButton>
            <PaginationButton
              onClick={() => onPageChange!(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </PaginationButton>
            <PaginationButton
              onClick={() => onPageChange!(page + 1)}
              disabled={page >= totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </PaginationButton>
            <PaginationButton
              onClick={() => onPageChange!(totalPages)}
              disabled={page >= totalPages}
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </PaginationButton>
          </div>
        </div>
      )}
    </div>
  );
}

function PaginationButton({
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center h-8 w-8 rounded-lg text-sm transition-colors",
        disabled
          ? "text-muted-foreground/40 cursor-not-allowed"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
      {...props}
    >
      {children}
    </button>
  );
}
