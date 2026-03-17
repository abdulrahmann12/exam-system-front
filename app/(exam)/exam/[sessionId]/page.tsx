"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useExamStore } from "@/store/examStore";
import { useExamTimer } from "@/hooks/useExamTimer";
import { sessionService } from "@/services/sessionService";
import { ExamTopBar } from "@/components/Exam/ExamTopBar";
import { QuestionGrid } from "@/components/Exam/QuestionGrid";
import { QuestionView } from "@/components/Exam/QuestionView";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { toast } from "sonner";

export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = Number(params.sessionId);

  // Direction tracking for slide animation
  const [direction, setDirection] = useState(0);
  const prevIndexRef = useRef(0);

  const {
    init,
    loading,
    ended,
    currentIndex,
    questions,
    endExam,
    goNext,
    goTo,
  } = useExamStore();

  // Track direction on index change
  useEffect(() => {
    setDirection(currentIndex > prevIndexRef.current ? 1 : -1);
    prevIndexRef.current = currentIndex;
  }, [currentIndex]);

  // ── Load session data ───────────────────────────────────
  useEffect(() => {
    if (!sessionId || isNaN(sessionId)) return;
    sessionService
      .getQuestions(sessionId)
      .then((res) => {
        const data = res.data?.data;
        if (data) {
          init(data);
        } else {
          toast.error("Session not found");
          router.push("/my-sessions");
        }
      })
      .catch(() => {
        toast.error("Failed to load exam");
        router.push("/my-sessions");
      });
  }, [sessionId, router, init]);

  // ── Timer callbacks ─────────────────────────────────────
  const handleGlobalExpire = useCallback(async () => {
    toast.error("Time is up! Submitting your exam...");
    try {
      await endExam();
    } catch {
      toast.error("Failed to submit — please try the Finish button.");
    }
  }, [endExam]);

  const handleQuestionExpire = useCallback(() => {
    // Auto-advance to next question when per-question timer expires
    const { currentIndex: ci, questions: qs } = useExamStore.getState();
    if (ci < qs.length - 1) {
      toast.info("Time's up for this question — moving to next.");
      goNext();
    } else {
      toast.info("Last question time expired.");
    }
  }, [goNext]);

  const timer = useExamTimer({
    onGlobalExpire: handleGlobalExpire,
    onQuestionExpire: handleQuestionExpire,
  });

  // ── Finish exam ─────────────────────────────────────────
  const [finishing, setFinishing] = useState(false);
  const handleFinish = useCallback(async () => {
    if (!confirm("End the exam and submit? You cannot change answers after this.")) return;
    setFinishing(true);
    try {
      await endExam();
      toast.success("Exam submitted!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setFinishing(false);
    }
  }, [endExam]);

  // ── Loading state ───────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading your exam...</p>
        </div>
      </div>
    );
  }

  // ── Ended state ─────────────────────────────────────────
  if (ended) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card padding="lg" className="max-w-md w-full text-center space-y-4">
          <div className="text-4xl">🎉</div>
          <h2 className="text-xl font-bold text-foreground">Exam Submitted</h2>
          <p className="text-muted-foreground">
            Your answers have been submitted successfully. You can view your results
            in My Sessions.
          </p>
          <Link href="/my-sessions">
            <Button>View My Sessions</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // ── Main exam UI ────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ExamTopBar
        globalDisplay={timer.globalDisplay}
        questionDisplay={timer.questionDisplay}
        globalWarning={timer.globalWarning}
        questionWarning={timer.questionWarning}
        onFinish={handleFinish}
      />

      <div className="flex-1 flex">
        {/* Main question area */}
        <main className="flex-1 px-3 sm:px-8 lg:px-12 py-4 sm:py-6 max-w-4xl mx-auto w-full">
          <QuestionView direction={direction} />
        </main>

        {/* Side panel — question grid (hidden on mobile, shown as bottom bar) */}
        <aside className="hidden lg:block w-64 border-l border-border p-4 shrink-0">
          <QuestionGrid />
        </aside>
      </div>

      {/* Mobile question grid — bottom sheet */}
      <div className="lg:hidden border-t border-border p-3 bg-background/80 backdrop-blur-sm">
        <QuestionGrid />
      </div>
    </div>
  );
}
