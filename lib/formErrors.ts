import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

/**
 * Maps backend error messages to react-hook-form field errors.
 *
 * The backend returns messages like:
 *   "Username already exists"
 *   "Email is already taken"
 *   "Student code already registered"
 *
 * This mapper checks error text against keyword→field rules
 * and calls `setError` on the matching field.
 * Returns `true` if at least one field error was mapped.
 */

interface FieldMapping {
  /** Keywords to match (case-insensitive) in the error message */
  keywords: string[];
  /** The form field to attach the error to */
  field: string;
}

const DEFAULT_MAPPINGS: FieldMapping[] = [
  { keywords: ["username"], field: "username" },
  { keywords: ["email"], field: "email" },
  { keywords: ["phone"], field: "phone" },
  { keywords: ["password", "credential"], field: "password" },
  { keywords: ["student code", "studentcode"], field: "studentCode" },
  { keywords: ["college"], field: "collegeId" },
  { keywords: ["department"], field: "departmentId" },
  { keywords: ["subject"], field: "subjectId" },
  { keywords: ["title"], field: "title" },
  { keywords: ["duration"], field: "durationMinutes" },
  { keywords: ["start time", "starttime"], field: "startTime" },
  { keywords: ["end time", "endtime"], field: "endTime" },
  { keywords: ["question"], field: "questions" },
];

export function mapServerError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  extraMappings: FieldMapping[] = []
): boolean {
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";
  if (!message) return false;

  const lower = message.toLowerCase();
  const allMappings = [...DEFAULT_MAPPINGS, ...extraMappings];

  for (const mapping of allMappings) {
    if (mapping.keywords.some((kw) => lower.includes(kw))) {
      setError(mapping.field as Path<T>, {
        type: "server",
        message,
      });
      return true;
    }
  }

  return false;
}
