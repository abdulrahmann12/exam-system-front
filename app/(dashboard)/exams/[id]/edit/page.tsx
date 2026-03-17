"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { examService } from "@/services/examService";
import ExamForm from "@/components/ExamForm";
import { toast } from "sonner";
import type { ExamDetail } from "@/types/exam";

export default function EditExamPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || isNaN(id)) return;
    examService
      .getById(id)
      .then((res) => {
        const data = res.data?.data;
        if (data) setExam(data);
        else throw new Error("No data");
      })
      .catch(() => {
        toast.error("Exam not found");
        router.push("/exams");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!exam) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Edit exam</h1>
      <ExamForm mode="edit" initialData={exam} />
    </div>
  );
}
