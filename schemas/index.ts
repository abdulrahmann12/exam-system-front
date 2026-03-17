import { z } from "zod/v4";

// ── Auth schemas ────────────────────────────────────────────
export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(6, "Phone is required"),
  collegeId: z.number().int().positive("Select a college"),
  departmentId: z.number().int().positive("Select a department"),
  studentCode: z.string().min(1, "Student code is required"),
  academicYear: z.number().int().min(1).max(7),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgetPasswordSchema = z.object({
  email: z.email("Invalid email"),
});
export type ForgetPasswordFormValues = z.infer<typeof forgetPasswordSchema>;

export const resetPasswordSchema = z.object({
  email: z.email("Invalid email"),
  code: z.string().min(1, "Verification code is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// ── Exam schemas ────────────────────────────────────────────
const choiceSchema = z.object({
  choiceText: z.string().min(1, "Choice text is required"),
  isCorrect: z.boolean(),
  choiceOrder: z.number().int().min(1),
});

const questionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  questionType: z.enum(["MCQ", "TRUE_FALSE", "ESSAY"]),
  marks: z.number().int().min(1, "Marks must be at least 1"),
  questionOrder: z.number().int().min(1),
  choices: z.array(choiceSchema),
}).check(
  (ctx) => {
    if (ctx.value.questionType !== "ESSAY" && ctx.value.choices.length < 2) {
      ctx.issues.push({
        code: "custom",
        input: ctx.value,
        message: "Non-essay questions must have at least 2 choices",
        path: ["choices"],
      });
    }
    if (ctx.value.questionType !== "ESSAY" && !ctx.value.choices.some((c) => c.isCorrect)) {
      ctx.issues.push({
        code: "custom",
        input: ctx.value,
        message: "Mark at least one choice as correct",
        path: ["choices"],
      });
    }
  }
);

export const examSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  collegeId: z.number().int().positive("Select a college"),
  departmentId: z.number().int().positive("Select a department"),
  subjectId: z.number().int().positive("Select a subject"),
  durationMinutes: z.number().int().min(1, "Duration must be at least 1 minute"),
  perQuestionTimeSeconds: z.number().int().min(0),
  allowBackNavigation: z.boolean(),
  randomizeQuestions: z.boolean(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  isActive: z.boolean(),
  questions: z.array(questionSchema).min(1, "Add at least one question"),
});
export type ExamFormValues = z.infer<typeof examSchema>;

// ── Admin CRUD schemas ──────────────────────────────────────
export const collegeSchema = z.object({
  collegeName: z.string().min(1, "College name is required"),
});
export type CollegeFormValues = z.infer<typeof collegeSchema>;

export const departmentSchema = z.object({
  departmentName: z.string().min(1, "Department name is required"),
  collegeId: z.number().int().positive("Select a college"),
});
export type DepartmentFormValues = z.infer<typeof departmentSchema>;

export const subjectSchema = z.object({
  subjectName: z.string().min(1, "Subject name is required"),
  subjectCode: z.string().min(1, "Subject code is required"),
  collegeId: z.number().int().positive("Select a college"),
  departmentId: z.number().int().positive("Select a department"),
});
export type SubjectFormValues = z.infer<typeof subjectSchema>;

export const roleSchema = z.object({
  roleName: z.string().min(1, "Role name is required"),
  permissionIds: z.array(z.number().int()).min(1, "Select at least one permission"),
});
export type RoleFormValues = z.infer<typeof roleSchema>;

export const adminUserSchema = z.object({
  roleId: z.number().int().positive("Select a role"),
  collegeId: z.number().int().optional(),
  departmentId: z.number().int().optional(),
  isActive: z.boolean(),
});
export type AdminUserFormValues = z.infer<typeof adminUserSchema>;
