"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { loginSchema, type LoginFormValues } from "@/schemas";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardTitle } from "@/components/ui/Card";
import { toast } from "sonner";

/**
 * Listens for the `auth:session-expired` CustomEvent (dispatched by
 * the Axios interceptor on /exam/* routes) and shows an inline login
 * form over a blurred backdrop. Successfully re-authenticating closes
 * the modal without navigating away from the exam.
 */
export function ReAuthModal() {
  const [open, setOpen] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { usernameOrEmail: "", password: "" },
  });

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("auth:session-expired", handler);
    return () => window.removeEventListener("auth:session-expired", handler);
  }, []);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.usernameOrEmail.trim(), data.password);
      toast.success("Session restored");
      setOpen(false);
      reset();
    } catch {
      toast.error("Authentication failed. Try again.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Blurred backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative z-10 w-full max-w-sm mx-4"
          >
            <Card className="shadow-2xl">
              <CardTitle className="text-lg text-center mb-1">
                Session Expired
              </CardTitle>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Your session expired during the exam. Sign in again to continue.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <Input
                  label="Username or Email"
                  autoComplete="username"
                  error={errors.usernameOrEmail?.message}
                  {...register("usernameOrEmail")}
                />
                <Input
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register("password")}
                />
                <Button type="submit" fullWidth loading={isSubmitting}>
                  Sign in &amp; Continue
                </Button>
              </form>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
