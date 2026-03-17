"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useExamStore } from "@/store/examStore";
import { Button } from "@/components/ui/Button";
import type { ExamQuestionItem } from "@/types/session";

// ── Slide animation variants ────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -300 : 300,
    opacity: 0,
  }),
};

// ── MCQ / True-False Choices ────────────────────────────────
function ChoiceList({
  question,
  selectedChoiceId,
  onSelect,
}: {
  question: ExamQuestionItem;
  selectedChoiceId: number | undefined;
  onSelect: (choiceId: number) => void;
}) {
  return (
    <ul className="space-y-2">
      {question.choices
        .sort((a, b) => a.choiceOrder - b.choiceOrder)
        .map((choice) => {
          const selected = selectedChoiceId === choice.choiceId;
          return (
            <li key={choice.choiceId}>
              <button
                type="button"
                onClick={() => onSelect(choice.choiceId)}
                className={cn(
                  "w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 transition-all duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "active:scale-[0.98]",
                  selected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40 hover:bg-accent/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-colors",
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-muted-foreground/40 text-muted-foreground"
                    )}
                  >
                    {String.fromCharCode(65 + question.choices.indexOf(choice))}
                  </span>
                  <span className={cn("text-sm", selected ? "text-foreground font-medium" : "text-foreground")}>
                    {choice.choiceText}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
    </ul>
  );
}

// ── Essay Answer ────────────────────────────────────────────
function EssayInput({
  questionId,
  initialText,
  onSubmit,
}: {
  questionId: number;
  initialText: string;
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState(initialText);

  const handleBlur = useCallback(() => {
    if (text.trim() !== initialText.trim()) {
      onSubmit(text);
    }
  }, [text, initialText, onSubmit]);

  return (
    <div className="space-y-2">
      <textarea
        className={cn(
          "w-full min-h-[180px] rounded-xl border-2 border-border bg-background p-4 text-sm",
          "placeholder:text-muted-foreground resize-y",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        )}
        placeholder="Type your answer here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
      />
      <p className="text-xs text-muted-foreground">
        {text.length} characters · Auto-saved on blur
      </p>
    </div>
  );
}

// ── Main QuestionView ───────────────────────────────────────
interface QuestionViewProps {
  /** Direction of slide animation: 1 = forward, -1 = backward */
  direction: number;
}

export function QuestionView({ direction }: QuestionViewProps) {
  const questions = useExamStore((s) => s.questions);
  const currentIndex = useExamStore((s) => s.currentIndex);
  const answers = useExamStore((s) => s.answers);
  const flagged = useExamStore((s) => s.flagged);
  const submitAnswer = useExamStore((s) => s.submitAnswer);
  const toggleFlag = useExamStore((s) => s.toggleFlag);
  const goNext = useExamStore((s) => s.goNext);
  const goPrev = useExamStore((s) => s.goPrev);
  const allowBack = useExamStore((s) => s.allowBackNavigation);

  const question = questions[currentIndex];
  if (!question) return null;

  const answer = answers[question.questionId];
  const isFlagged = flagged.has(question.questionId);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  const handleChoiceSelect = (choiceId: number) => {
    submitAnswer(question.questionId, { choiceId });
  };

  const handleEssaySubmit = (text: string) => {
    submitAnswer(question.questionId, { answerText: text });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Question content with slide animation */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={question.questionId}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="space-y-6"
          >
            {/* Question header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="px-2 py-0.5 rounded-full bg-muted font-medium">
                  {currentIndex + 1} / {questions.length}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-muted">
                  {question.questionType === "TRUE_FALSE"
                    ? "True / False"
                    : question.questionType}
                </span>
                <span>{question.marks} mark{question.marks !== 1 ? "s" : ""}</span>
                {!answer?.synced && answer && (
                  <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    Saving...
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-foreground leading-relaxed">
                {question.questionText}
              </h2>
            </div>

            {/* Answer area */}
            {question.questionType === "ESSAY" ? (
              <EssayInput
                questionId={question.questionId}
                initialText={answer?.answerText ?? ""}
                onSubmit={handleEssaySubmit}
              />
            ) : (
              <ChoiceList
                question={question}
                selectedChoiceId={answer?.choiceId}
                onSelect={handleChoiceSelect}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={isFirst || !allowBack}
        >
          ← Previous
        </Button>

        <button
          type="button"
          onClick={() => toggleFlag(question.questionId)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            isFlagged
              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          {isFlagged ? "★ Flagged" : "☆ Flag for review"}
        </button>

        <Button
          onClick={goNext}
          disabled={isLast}
        >
          Next →
        </Button>
      </div>
    </div>
  );
}
