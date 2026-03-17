"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Rotating messages during AI parse phase ─────────────────
const PARSE_MESSAGES = [
  "Analyzing document structure...",
  "Extracting questions...",
  "Identifying answer choices...",
  "Mapping correct answers...",
  "Validating question format...",
  "Almost done...",
];

interface AIUploadDropzoneProps {
  /** Called with the selected file. Should return parsed questions or throw. */
  onUpload: (file: File) => Promise<void>;
  /** Accepted MIME types */
  accept?: Record<string, string[]>;
  /** Max file size in bytes (default 10MB) */
  maxSize?: number;
  className?: string;
}

type Phase = "idle" | "uploading" | "parsing" | "done" | "error";

export function AIUploadDropzone({
  onUpload,
  accept = {
    "application/pdf": [".pdf"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "text/plain": [".txt"],
  },
  maxSize = 10 * 1024 * 1024,
  className,
}: AIUploadDropzoneProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [messageIdx, setMessageIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  // Rotate messages during parse phase
  useEffect(() => {
    if (phase === "parsing") {
      setMessageIdx(0);
      intervalRef.current = setInterval(() => {
        setMessageIdx((i) => (i + 1) % PARSE_MESSAGES.length);
      }, 2500);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  const processFile = useCallback(
    async (file: File) => {
      setPhase("uploading");
      setUploadProgress(0);
      setErrorMsg("");

      // Simulate upload progress (determinate)
      const sim = setInterval(() => {
        setUploadProgress((p) => {
          if (p >= 95) {
            clearInterval(sim);
            return 95;
          }
          return p + Math.random() * 15;
        });
      }, 200);

      try {
        // Finish upload bar instantly before parse
        setUploadProgress(100);
        clearInterval(sim);

        setPhase("parsing");
        await onUpload(file);
        setPhase("done");
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Upload failed");
        setPhase("error");
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxSize,
    multiple: false,
    disabled: phase === "uploading" || phase === "parsing",
    onDropAccepted: ([file]) => {
      if (file) processFile(file);
    },
    onDropRejected: (rejections) => {
      const msg = rejections[0]?.errors[0]?.message || "Invalid file";
      setErrorMsg(msg);
      setPhase("error");
    },
  });

  const reset = () => {
    setPhase("idle");
    setUploadProgress(0);
    setErrorMsg("");
  };

  return (
    <div className={cn("relative", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50",
          (phase === "uploading" || phase === "parsing") &&
            "pointer-events-none opacity-80"
        )}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {phase === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-4xl mb-2">📄</div>
              <p className="font-medium text-foreground">
                {isDragActive
                  ? "Drop your file here..."
                  : "Drag & drop a file, or click to browse"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, DOCX, or TXT — max {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </motion.div>
          )}

          {phase === "uploading" && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <p className="text-sm font-medium text-foreground">Uploading...</p>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(uploadProgress, 100)}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(uploadProgress)}%
              </p>
            </motion.div>
          )}

          {phase === "parsing" && (
            <motion.div
              key="parsing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex justify-center">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={messageIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-sm text-foreground"
                >
                  {PARSE_MESSAGES[messageIdx]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}

          {phase === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="text-3xl">✅</div>
              <p className="text-sm font-medium text-foreground">
                Questions imported successfully!
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
                className="text-xs text-primary hover:underline"
              >
                Upload another file
              </button>
            </motion.div>
          )}

          {phase === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="text-3xl">❌</div>
              <p className="text-sm text-destructive">{errorMsg}</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
                className="text-xs text-primary hover:underline"
              >
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
