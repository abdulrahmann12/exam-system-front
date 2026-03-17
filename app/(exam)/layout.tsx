"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ReAuthModal } from "@/components/ReAuthModal";

export default function ExamRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No sidebar, no dashboard chrome — just auth guard + re-auth modal.
  // The ExamFocusLayout is applied by the page itself
  // so it controls progress/timer/quit props.
  return (
    <ProtectedRoute>
      {children}
      <ReAuthModal />
    </ProtectedRoute>
  );
}
