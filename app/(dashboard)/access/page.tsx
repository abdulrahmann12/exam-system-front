"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { sessionService } from "@/services/sessionService";
import { studentService } from "@/services/studentService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { toast } from "sonner";
import type { ExamAccessResponse } from "@/types/session";

export default function AccessPage() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const [token, setToken] = useState(tokenFromUrl);
  const [exam, setExam] = useState<ExamAccessResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"enter" | "verify" | "ready">("enter");
  const [studentCode, setStudentCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [startLoading, setStartLoading] = useState(false);

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error("Enter the QR token");
      return;
    }
    setLoading(true);
    try {
      const res = await sessionService.access(token.trim());
      const data = res.data?.data;
      if (data) {
        setExam(data);
        setStep("verify");
        const me = await studentService.getMe().catch(() => null);
        if (me?.data?.data?.studentCode) setStudentCode(me.data.data.studentCode);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid or expired token");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exam || !studentCode.trim()) return;
    setVerifyLoading(true);
    try {
      await sessionService.verifyStudent({
        examId: exam.examId,
        studentCode: studentCode.trim(),
        token: token.trim(),
      });
      setStep("ready");
      toast.success("Identity verified");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exam || !studentCode.trim()) return;
    setStartLoading(true);
    try {
      const res = await sessionService.start({
        examId: exam.examId,
        studentCode: studentCode.trim(),
        token: token.trim(),
      });
      const data = res.data?.data;
      if (data?.sessionId) {
        toast.success("Exam started");
        window.location.href = `/exam/${data.sessionId}`;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start");
    } finally {
      setStartLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Exam access</h1>

      {step === "enter" && (
        <Card>
          <CardHeader>
            <CardTitle>Enter QR token</CardTitle>
            <p className="text-sm text-zinc-500 mt-1">
              Scan the exam QR code or paste the token you received
            </p>
          </CardHeader>
          <form onSubmit={handleAccess} className="space-y-4">
            <Input
              label="Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="e.g. ac5d22b1-e2dc-4de5-b036-f84a66cab314"
            />
            <Button type="submit" fullWidth loading={loading}>
              Access exam
            </Button>
          </form>
        </Card>
      )}

      {step === "verify" && exam && (
        <Card>
          <CardHeader>
            <CardTitle>{exam.title}</CardTitle>
            <p className="text-sm text-zinc-500 mt-1">{exam.description}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              {exam.durationMinutes} min · {exam.totalQuestions} questions
            </p>
          </CardHeader>
          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              label="Student code"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              placeholder="Your university student code"
              required
            />
            <Button type="submit" fullWidth loading={verifyLoading}>
              Verify identity
            </Button>
          </form>
        </Card>
      )}

      {step === "ready" && exam && (
        <Card>
          <CardHeader>
            <CardTitle>Ready to start</CardTitle>
            <p className="text-sm text-zinc-500 mt-1">{exam.title}</p>
          </CardHeader>
          <form onSubmit={handleStart} className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              You have {exam.durationMinutes} minutes. Once you start, the timer begins.
            </p>
            <Button type="submit" fullWidth loading={startLoading} size="lg">
              Start exam
            </Button>
          </form>
        </Card>
      )}

      <p className="text-center text-sm text-zinc-500">
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-700">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}
