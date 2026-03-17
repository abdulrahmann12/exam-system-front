"use client";

import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "./ThemeToggle";
import { MobileMenuButton } from "./MobileSidebar";
import { LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header
      className={cn(
        "sticky top-0 z-20 h-14 flex items-center gap-4 px-4 sm:px-6",
        "border-b border-border glass"
      )}
    >
      <MobileMenuButton />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* User badge */}
        {user && (
          <Link
            href="/profile"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>
            <span className="text-sm font-medium text-foreground">
              {user.firstName} {user.lastName}
            </span>
          </Link>
        )}

        {/* Logout */}
        <button
          onClick={() => logout()}
          className={cn(
            "inline-flex items-center justify-center h-9 w-9 rounded-lg",
            "text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          )}
          aria-label="Log out"
          title="Log out"
        >
          <LogOut className="h-[18px] w-[18px]" />
        </button>
      </div>
    </header>
  );
}
