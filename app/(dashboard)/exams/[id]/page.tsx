"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { examService } from "@/services/examService";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { toast } from "sonner";
import type { ExamDetail } from "@/types/exam";

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || isNaN(id)) return;
    examService
      .getById(id)
      .then((res) => setExam(res.data?.data ?? null))
      .catch(() => {
        toast.error("Exam not found");
        router.push("/exams");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleGenerateQr = async () => {
    try {
      const res = await examService.generateQr(id);
      const data = res.data?.data;
      if (data?.qrCodeUrl) {
        window.open(data.qrCodeUrl, "_blank");
        toast.success("QR code generated. It expires in 2 minutes.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate QR");
    }
  };

  if (loading || !exam) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <Link href="/exams" className="text-sm text-indigo-600 hover:text-indigo-700 mb-2 inline-block">
            ← Back to exams
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{exam.title}</h1>
          {exam.description && (
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">{exam.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/exams/${id}/edit`)}>
            Edit
          </Button>
          <Button onClick={handleGenerateQr}>Generate QR code</Button>
        </div>
      </div>

      <Card>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Details</h3>
        <ul className="grid gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li>Duration: {exam.durationMinutes} minutes</li>
          <li>Per question: {exam.perQuestionTimeSeconds} seconds</li>
          <li>Total questions: {exam.totalQuestions}</li>
          <li>Back navigation: {exam.allowBackNavigation ? "Yes" : "No"}</li>
          <li>Randomize questions: {exam.randomizeQuestions ? "Yes" : "No"}</li>
          {exam.startTime && <li>Start: {new Date(exam.startTime).toLocaleString()}</li>}
          {exam.endTime && <li>End: {new Date(exam.endTime).toLocaleString()}</li>}
        </ul>
      </Card>

      <Card>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Questions</h3>
        <ol className="space-y-4">
          {exam.questions?.map((q, i) => (
            <li key={q.questionId} className="border-b border-zinc-200 dark:border-zinc-700 pb-4 last:border-0">
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {i + 1}. {q.questionText}
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                Type: {q.questionType} · Marks: {q.marks}
              </p>
              {q.choices?.length > 0 && (
                <ul className="mt-2 ml-4 list-disc text-sm text-zinc-600 dark:text-zinc-400">
                  {q.choices.map((c) => (
                    <li key={c.choiceId}>
                      {c.choiceText} {c.isCorrect ? "✓" : ""}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
