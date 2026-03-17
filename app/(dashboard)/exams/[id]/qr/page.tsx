"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Copy, RefreshCw, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { examService } from "@/services/examService";
import { Button } from "@/components/ui/Button";
import type { QrResponse } from "@/types/exam";

export default function ExamQrPage() {
  const params = useParams();
  const id = Number(params.id);
  const [qr, setQr] = useState<QrResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const generate = useCallback(async () => {
    try {
      const res = await examService.generateQr(id);
      const data = res.data?.data ?? null;
      setQr(data);
      if (data?.expiresAt) {
        const diff = Math.max(0, Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000));
        setSecondsLeft(diff);
      }
    } catch {
      toast.error("Failed to generate QR code");
    }
  }, [id]);

  useEffect(() => {
    if (!id || isNaN(id)) return;
    generate().finally(() => setLoading(false));
  }, [id, generate]);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const expired = secondsLeft <= 0 && qr !== null;

  const accessUrl =
    typeof window !== "undefined" && qr?.qrToken
      ? `${window.location.origin}/access?token=${encodeURIComponent(qr.qrToken)}`
      : "";

  const handleCopy = async () => {
    if (!accessUrl) return;
    await navigator.clipboard.writeText(accessUrl);
    toast.success("Link copied to clipboard");
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    await generate();
    setRegenerating(false);
    toast.success("New QR code generated");
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Link
        href={`/exams/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to exam
      </Link>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">Exam QR Code</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Students scan this code to access the exam.
          </p>
        </div>

        {/* QR Image with optional expired overlay */}
        <div className="relative mx-auto w-64 h-64">
          {qr?.qrCodeUrl && (
            <div className="w-full h-full rounded-xl border border-border bg-white overflow-hidden">
              <Image
                src={qr.qrCodeUrl}
                alt="Exam QR code"
                fill
                unoptimized
                className="object-contain p-3"
              />
            </div>
          )}
          {expired && (
            <div className="absolute inset-0 rounded-xl bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <span className="text-sm font-medium text-destructive">Expired</span>
            </div>
          )}
        </div>

        {/* Timer */}
        <div className="flex justify-center">
          {expired ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 text-destructive px-3 py-1 text-sm font-medium">
              <Clock className="h-3.5 w-3.5" /> Token expired
            </span>
          ) : (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
              secondsLeft <= 30
                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            }`}>
              <Clock className="h-3.5 w-3.5" /> {formatTime(secondsLeft)} remaining
            </span>
          )}
        </div>

        {/* Token */}
        <p className="text-xs font-mono text-muted-foreground break-all text-center bg-muted rounded-lg px-3 py-2">
          {qr?.qrToken}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" fullWidth onClick={handleCopy} disabled={!accessUrl}>
            <Copy className="h-4 w-4 mr-2" /> Copy Link
          </Button>
          <Button variant="secondary" size="sm" fullWidth onClick={handleRegenerate} loading={regenerating}>
            <RefreshCw className="h-4 w-4 mr-2" /> Regenerate
          </Button>
        </div>
      </div>
    </div>
  );
}
