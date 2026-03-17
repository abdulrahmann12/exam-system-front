"use client";

import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

/** Styled label + input + error wrapper for use with RHF. */
export function FormField({ label, error, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-sm font-medium text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/** Shared input styling for register */
export const inputClass = cn(
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
  "placeholder:text-muted-foreground",
  "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
  "disabled:opacity-50 disabled:cursor-not-allowed"
);

export const selectClass = cn(inputClass, "appearance-none");
