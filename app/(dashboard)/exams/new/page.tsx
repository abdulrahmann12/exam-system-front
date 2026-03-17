"use client";

import ExamForm from "@/components/ExamForm";

export default function NewExamPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Create exam</h1>
      <ExamForm mode="create" />
    </div>
  );
}
