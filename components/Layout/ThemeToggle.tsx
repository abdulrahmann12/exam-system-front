"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const modes = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-8 w-8" />;

  // Cycle: light → dark → system → light
  const cycle = () => {
    const order = ["light", "dark", "system"];
    const next = order[(order.indexOf(theme ?? "system") + 1) % order.length];
    setTheme(next);
  };

  const current = modes.find((m) => m.value === theme) ?? modes[2];
  const Icon = current.icon;

  return (
    <button
      onClick={cycle}
      className={cn(
        "inline-flex items-center justify-center h-9 w-9 rounded-lg",
        "text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      )}
      aria-label={`Switch theme (current: ${current.label})`}
      title={current.label}
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
  );
}
