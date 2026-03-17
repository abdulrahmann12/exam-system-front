import { create } from "zustand";

interface SidebarState {
  /** Desktop: collapsed (icons-only) vs expanded */
  isCollapsed: boolean;
  /** Mobile: sheet open/closed */
  isMobileOpen: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setMobileOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  isMobileOpen: false,
  toggle: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
  setCollapsed: (isCollapsed) => set({ isCollapsed }),
  setMobileOpen: (isMobileOpen) => set({ isMobileOpen }),
}));
