import { create } from "zustand";
import { setTokens, clearTokens, getAccessToken } from "@/lib/auth/token";
import { decodeToken } from "@/lib/jwt";
import type { UserProfile } from "@/types/user";

interface AuthState {
  user: UserProfile | null;
  permissions: string[];
  role: string | null;
  isHydrated: boolean;
  setUser: (user: UserProfile | null) => void;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
  hydrate: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  permissions: [],
  role: null,
  isHydrated: false,

  setUser: (user) => set({ user }),

  setTokens: (access, refresh) => {
    setTokens(access, refresh);
    const decoded = decodeToken(access);
    set({
      permissions: decoded?.permissions ?? [],
      role: decoded?.role ?? null,
    });
  },

  logout: () => {
    clearTokens();
    set({ user: null, permissions: [], role: null });
  },

  hydrate: () => {
    const token = getAccessToken();
    if (!token) {
      set({ user: null, permissions: [], role: null, isHydrated: true });
      return;
    }
    const decoded = decodeToken(token);
    if (!decoded) {
      // Token expired or invalid — clear everything
      clearTokens();
      set({ user: null, permissions: [], role: null, isHydrated: true });
      return;
    }
    set({
      permissions: decoded.permissions ?? [],
      role: decoded.role ?? null,
      isHydrated: true,
    });
  },

  isAuthenticated: () => !!getAccessToken(),
}));
