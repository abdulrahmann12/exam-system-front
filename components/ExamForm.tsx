"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useForm,
  useFieldArray,
  Controller,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { examSchema, type ExamFormValues } from "@/schemas";
import { mapServerError } from "@/lib/formErrors";
import { useAcademicCascade } from "@/hooks/useAcademicCascade";
import { examService } from "@/services/examService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { FormField, selectClass } from "@/components/ui/FormField";
import { toast } from "sonner";
import type { ExamDetail } from "@/types/exam";
import type { QuestionType } from "@/types/exam";

// ── Helpers ─────────────────────────────────────────────────
const emptyChoice = (order: number) => ({
  choiceText: "",
  isCorrect: false,
  choiceOrder: order,
});

const emptyQuestion = (order: number) => ({
  questionText: "",
  questionType: "MCQ" as QuestionType,
  marks: 5,
  questionOrder: order,
  choices: [emptyChoice(1), emptyChoice(2)],
});

function toLocalDatetimeValue(iso: string | undefined) {
  if (!iso) return "";
  return iso.slice(0, 16);
}

function fromLocalDatetime(value: string) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 19);
}

// ── Choice list for a single question ───────────────────────
function ChoiceList({
  questionIndex,
  form,
}: {
  questionIndex: number;
  form: UseFormReturn<ExamFormValues>;
}) {
  const { control, register, watch, setValue } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${questionIndex}.choices`,
  });

  const questionType = watch(`questions.${questionIndex}.questionType`);
  if (questionType === "ESSAY") return null;

  return (
    <div className="space-y-2 mt-3">
      <p className="text-xs font-medium text-muted-foreground">Choices</p>
      <AnimatePresence initial={false}>
        {fields.map((field, ci) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 items-center"
          >
            <Input
              className="flex-1"
              placeholder={`Choice ${ci + 1}`}
              {...register(`questions.${questionIndex}.choices.${ci}.choiceText`)}
            />
            <label className="flex items-center gap-1 whitespace-nowrap text-sm">
              <input
                type="radio"
                name={`q-${questionIndex}-correct`}
                checked={watch(`questions.${questionIndex}.choices.${ci}.isCorrect`)}
                onChange={() => {
                  // Mark only this choice correct, unmark others
                  fields.forEach((_, idx) => {
                    setValue(
                      `questions.${questionIndex}.choices.${idx}.isCorrect`,
                      idx === ci,
                      { shouldValidate: true }
                    );
                  });
                }}
              />
              Correct
            </label>
            {fields.length > 2 && (
              <button
                type="button"
                onClick={() => remove(ci)}
                className="text-destructive text-xs hover:underline"
              >
                ✕
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => append(emptyChoice(fields.length + 1))}
      >
        + Add choice
      </Button>
      {form.formState.errors.questions?.[questionIndex]?.choices?.message && (
        <p className="text-xs text-destructive">
          {form.formState.errors.questions[questionIndex].choices.message}
        </p>
      )}
    </div>
  );
}

// ── Question card ───────────────────────────────────────────
function QuestionCard({
  index,
  form,
  onRemove,
}: {
  index: number;
  form: UseFormReturn<ExamFormValues>;
  onRemove: () => void;
}) {
  const { register, watch, setValue } = form;
  const questionType = watch(`questions.${index}.questionType`);
  const errors = form.formState.errors.questions?.[index];

  const onTypeChange = (type: QuestionType) => {
    setValue(`questions.${index}.questionType`, type, { shouldValidate: true });
    if (type === "TRUE_FALSE") {
      // Reset choices to True/False pair
      setValue(`questions.${index}.choices`, [
        { choiceText: "True", isCorrect: true, choiceOrder: 1 },
        { choiceText: "False", isCorrect: false, choiceOrder: 2 },
      ]);
    } else if (type === "ESSAY") {
      setValue(`questions.${index}.choices`, []);
    } else if (type === "MCQ") {
      const current = form.getValues(`questions.${index}.choices`);
      if (current.length < 2) {
        setValue(`questions.${index}.choices`, [emptyChoice(1), emptyChoice(2)]);
      }
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 rounded-lg border border-border space-y-3"
    >
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-muted-foreground">
          Question {index + 1}
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          Remove
        </Button>
      </div>

      <Input
        placeholder="Question text"
        error={errors?.questionText?.message}
        {...register(`questions.${index}.questionText`)}
      />

      <div className="flex gap-4 flex-wrap items-end">
        <FormField label="Type">
          <select
            className={selectClass}
            value={questionType}
            onChange={(e) => onTypeChange(e.target.value as QuestionType)}
          >
            <option value="MCQ">MCQ</option>
            <option value="TRUE_FALSE">True / False</option>
            <option value="ESSAY">Essay</option>
          </select>
        </FormField>
        <div className="w-24">
          <Input
            type="number"
            label="Marks"
            min={1}
            error={errors?.marks?.message}
            {...register(`questions.${index}.marks`, { valueAsNumber: true })}
          />
        </div>
      </div>

      <ChoiceList questionIndex={index} form={form} />
    </motion.div>
  );
}

// ── Main ExamForm ───────────────────────────────────────────
interface ExamFormProps {
  mode: "create" | "edit";
  initialData?: ExamDetail;
}

function examDetailToDefaults(exam: ExamDetail): ExamFormValues {
  return {
    title: exam.title,
    description: exam.description ?? "",
    collegeId: exam.collegeId ?? 0,
    departmentId: exam.departmentId ?? 0,
    subjectId: exam.subjectId ?? 0,
    durationMinutes: exam.durationMinutes,
    perQuestionTimeSeconds: exam.perQuestionTimeSeconds ?? 0,
    allowBackNavigation: exam.allowBackNavigation,
    randomizeQuestions: exam.randomizeQuestions,
    startTime: exam.startTime,
    endTime: exam.endTime,
    isActive: exam.isActive,
    questions: exam.questions.map((q) => ({
      questionText: q.questionText,
      questionType: q.questionType,
      marks: q.marks,
      questionOrder: q.questionOrder,
      choices: q.choices.map((c) => ({
        choiceText: c.choiceText,
        isCorrect: c.isCorrect,
        choiceOrder: c.choiceOrder,
      })),
    })),
  };
}

const defaults: ExamFormValues = {
  title: "",
  description: "",
  collegeId: 0,
  departmentId: 0,
  subjectId: 0,
  durationMinutes: 60,
  perQuestionTimeSeconds: 0,
  allowBackNavigation: true,
  randomizeQuestions: false,
  startTime: "",
  endTime: "",
  isActive: true,
  questions: [emptyQuestion(1)],
};

export default function ExamForm({ mode, initialData }: ExamFormProps) {
  const router = useRouter();
  const {
    colleges,
    departments,
    subjects,
    loadingColleges,
    loadingDepartments,
    loadingSubjects,
    loadDepartments,
    loadSubjects,
  } = useAcademicCascade({ withSubjects: true });

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: initialData ? examDetailToDefaults(initialData) : defaults,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({ control, name: "questions" });

  // Academic cascade wiring
  const collegeId = watch("collegeId");
  const departmentId = watch("departmentId");

  const onCollegeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = Number(e.target.value);
      setValue("collegeId", id, { shouldValidate: true });
      setValue("departmentId", 0);
      setValue("subjectId", 0);
      loadDepartments(id);
      loadSubjects(0, id); // load all subjects for college
    },
    [setValue, loadDepartments, loadSubjects]
  );

  const onDepartmentChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = Number(e.target.value);
      setValue("departmentId", id, { shouldValidate: true });
      setValue("subjectId", 0);
      loadSubjects(id, collegeId);
    },
    [setValue, loadSubjects, collegeId]
  );

  // Re-trigger cascade on mount for edit mode
  if (initialData && colleges.length > 0 && departments.length === 0 && initialData.collegeId) {
    loadDepartments(initialData.collegeId);
    if (initialData.departmentId) {
      loadSubjects(initialData.departmentId, initialData.collegeId);
    }
  }

  const addQuestion = () => {
    appendQuestion(emptyQuestion(questionFields.length + 1));
  };

  const handleRemoveQuestion = (index: number) => {
    removeQuestion(index);
    // Re-order remaining questions
    const remaining = form.getValues("questions");
    remaining.forEach((_, i) => {
      setValue(`questions.${i}.questionOrder`, i + 1);
    });
  };

  const onSubmit = async (data: ExamFormValues) => {
    // Clean up: strip empty choices from essay questions and set orders
    const payload = {
      ...data,
      questions: data.questions.map((q, qi) => ({
        ...q,
        questionOrder: qi + 1,
        choices:
          q.questionType === "ESSAY"
            ? []
            : q.choices
                .filter((c) => c.choiceText.trim())
                .map((c, ci) => ({ ...c, choiceOrder: ci + 1 })),
      })),
    };

    try {
      if (mode === "create") {
        const res = await examService.create(payload);
        const created = res.data?.data;
        if (created?.examId) {
          toast.success("Exam created");
          router.push(`/exams/${created.examId}`);
        }
      } else {
        await examService.update(initialData!.examId, payload);
        toast.success("Exam updated");
        router.push(`/exams/${initialData!.examId}`);
      }
    } catch (err) {
      if (!mapServerError(err, setError)) {
        toast.error(err instanceof Error ? err.message : "Failed to save exam");
      }
    }
  };

  const totalMarks = watch("questions").reduce((sum, q) => sum + (q.marks || 0), 0);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ── Basic Info ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Info</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Title"
            error={errors.title?.message}
            {...register("title")}
          />
          <div className="sm:col-span-2">
            <FormField label="Description">
              <textarea
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                rows={2}
                {...register("description")}
              />
            </FormField>
          </div>

          {/* Academic cascade */}
          <FormField label="College" error={errors.collegeId?.message}>
            <select
              className={selectClass}
              value={collegeId || ""}
              onChange={onCollegeChange}
              disabled={loadingColleges}
            >
              <option value="">Select college</option>
              {colleges.map((c) => (
                <option key={c.collegeId} value={c.collegeId}>
                  {c.collegeName}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Department" error={errors.departmentId?.message}>
            <select
              className={selectClass}
              value={departmentId || ""}
              onChange={onDepartmentChange}
              disabled={!collegeId || loadingDepartments}
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.departmentId} value={d.departmentId}>
                  {d.departmentName}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Subject" error={errors.subjectId?.message}>
            <select
              className={selectClass}
              disabled={loadingSubjects || (!collegeId && !departmentId)}
              {...register("subjectId", { valueAsNumber: true })}
            >
              <option value="0">Select subject</option>
              {subjects.map((s) => (
                <option key={s.subjectId} value={s.subjectId}>
                  {s.subjectName} ({s.subjectCode})
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </Card>

      {/* ── Settings ───────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Duration (minutes)"
            type="number"
            min={1}
            error={errors.durationMinutes?.message}
            {...register("durationMinutes", { valueAsNumber: true })}
          />
          <Input
            label="Per-question time (seconds, 0 = no limit)"
            type="number"
            min={0}
            error={errors.perQuestionTimeSeconds?.message}
            {...register("perQuestionTimeSeconds", { valueAsNumber: true })}
          />

          <div className="flex items-center gap-6 sm:col-span-2">
            <Controller
              control={control}
              name="allowBackNavigation"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="rounded border-input"
                  />
                  Allow back navigation
                </label>
              )}
            />
            <Controller
              control={control}
              name="randomizeQuestions"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="rounded border-input"
                  />
                  Randomize questions
                </label>
              )}
            />
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="rounded border-input"
                  />
                  Active
                </label>
              )}
            />
          </div>

          <FormField label="Start time" error={errors.startTime?.message}>
            <Controller
              control={control}
              name="startTime"
              render={({ field }) => (
                <input
                  type="datetime-local"
                  className={selectClass}
                  value={toLocalDatetimeValue(field.value)}
                  onChange={(e) => field.onChange(fromLocalDatetime(e.target.value))}
                />
              )}
            />
          </FormField>

          <FormField label="End time" error={errors.endTime?.message}>
            <Controller
              control={control}
              name="endTime"
              render={({ field }) => (
                <input
                  type="datetime-local"
                  className={selectClass}
                  value={toLocalDatetimeValue(field.value)}
                  onChange={(e) => field.onChange(fromLocalDatetime(e.target.value))}
                />
              )}
            />
          </FormField>
        </div>
      </Card>

      {/* ── Questions ──────────────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Questions</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {questionFields.length} question{questionFields.length !== 1 ? "s" : ""} · {totalMarks} total marks
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
            + Add question
          </Button>
        </CardHeader>

        {errors.questions?.message && (
          <p className="text-sm text-destructive mb-4">{errors.questions.message}</p>
        )}

        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {questionFields.map((field, qi) => (
              <QuestionCard
                key={field.id}
                index={qi}
                form={form}
                onRemove={() => handleRemoveQuestion(qi)}
              />
            ))}
          </AnimatePresence>
        </div>
      </Card>

      {/* ── Actions ────────────────────────────────────────── */}
      <div className="flex gap-3">
        <Button type="submit" loading={isSubmitting}>
          {mode === "create" ? "Create exam" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            router.push(
              mode === "edit" && initialData
                ? `/exams/${initialData.examId}`
                : "/exams"
            )
          }
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
