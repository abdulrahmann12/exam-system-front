"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function HomePage() {
  const router = useRouter();
  // Compute auth status directly; do not block initial render on any async work.
  const isAuth = useAuthStore((s) => s.isAuthenticated());

  useEffect(() => {
    if (isAuth) {
      router.replace("/dashboard");
    }
  }, [isAuth, router]);

  if (isAuth) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 px-4">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Exam System</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-center max-w-md">
        Online examination platform. Sign in to access your dashboard or register as a student.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="px-6 py-3 rounded-lg border-2 border-indigo-600 text-indigo-600 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
