"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authService } from "@/services/authService";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/schemas";
import { mapServerError } from "@/lib/formErrors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "", code: "", newPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      await authService.resetPassword({
        email: data.email.trim(),
        code: data.code.trim(),
        newPassword: data.newPassword,
      });
      toast.success("Password reset successfully. You can sign in now.");
      router.push("/login");
    } catch (err) {
      if (!mapServerError(err, setError)) {
        toast.error(err instanceof Error ? err.message : "Reset failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Reset password</CardTitle>
          <p className="text-sm text-zinc-500 text-center mt-1">
            Enter the code from your email and your new password
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
          <Input
            label="Verification code"
            placeholder="5-digit code"
            error={errors.code?.message}
            {...register("code")}
          />
          <Input
            label="New password"
            type="password"
            placeholder="••••••••"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <Button type="submit" fullWidth loading={isSubmitting} size="lg">
            Reset password
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
