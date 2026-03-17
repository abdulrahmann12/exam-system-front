"use client";

import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebarStore";
import { Sidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";
import { Navbar } from "./Navbar";
import { PageTransition } from "./PageTransition";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar />
      {/* Mobile sidebar sheet */}
      <MobileSidebar />

      {/* Main area — offset by sidebar width on desktop */}
      <div
        className={cn(
          "flex flex-col min-h-screen transition-[margin-left] duration-300",
          isCollapsed ? "md:ml-[68px]" : "md:ml-60"
        )}
      >
        <Navbar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
