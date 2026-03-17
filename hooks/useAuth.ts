"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { toast } from "sonner";

export function useAuth() {
  const { user, setUser, setTokens: storeSetTokens, logout: storeLogout, hydrate, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const fetchUser = async () => {
    if (!isAuthenticated()) return;
    try {
      const res = await userService.getProfile();
      if (res.data?.data) setUser(res.data.data);
    } catch {
      storeLogout();
    }
  };

  useEffect(() => {
    if (isAuthenticated() && !user) void fetchUser();
  }, [isAuthenticated(), user]);

  const login = async (usernameOrEmail: string, password: string) => {
    const res = await authService.login({ usernameOrEmail, password });
    const data = res.data?.data;
    if (data?.accessToken && data?.refreshToken) {
      storeSetTokens(data.accessToken, data.refreshToken);
      await fetchUser();
      return;
    }
    throw new Error(res.data?.message || "Login failed");
  };

  const logout = async () => {
    await authService.logout();
    storeLogout();
    toast.success("Logged out");
    router.push("/login");
  };

  return {
    user,
    isAuthenticated: isAuthenticated(),
    login,
    logout,
    fetchUser,
  };
}
