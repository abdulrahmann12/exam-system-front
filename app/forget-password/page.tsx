"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authService } from "@/services/authService";
import { forgetPasswordSchema, type ForgetPasswordFormValues } from "@/schemas";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { toast } from "sonner";

export default function ForgetPasswordPage() {
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgetPasswordFormValues>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgetPasswordFormValues) => {
    try {
      await authService.forgetPassword({ email: data.email.trim() });
      setSentEmail(data.email.trim());
      toast.success("If an account exists, a reset code has been sent to your email.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    }
  };

  if (sentEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 px-4">
        <Card className="w-full max-w-md text-center">
          <CardTitle className="text-xl">Check your email</CardTitle>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Use the code we sent to <strong>{sentEmail}</strong> to reset your password.
          </p>
          <Link href="/reset-password" className="mt-4 inline-block">
            <Button>Go to Reset Password</Button>
          </Link>
          <Link href="/login" className="block mt-2 text-sm text-indigo-600 hover:text-indigo-700">
            Back to Login
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Forgot password</CardTitle>
          <p className="text-sm text-zinc-500 text-center mt-1">
            Enter your email and we&apos;ll send you a reset code
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Button type="submit" fullWidth loading={isSubmitting} size="lg">
            Send reset code
          </Button>
        </form>
        <p className="mt-4 text-center">
          <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-700">
            Back to Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
