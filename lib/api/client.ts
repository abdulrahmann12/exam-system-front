import axios, { AxiosError } from "axios";
import { apiConfig } from "./config";
import { getAccessToken, getRefreshToken, clearTokens, setTokens } from "@/lib/auth/token";
import { useAuthStore } from "@/store/authStore";
import type { BasicResponse } from "@/types/api";

const client = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: apiConfig.headers,
});

// ── Singleton refresh lock ──────────────────────────────────
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  const refresh = getRefreshToken();
  if (!refresh) {
    clearTokens();
    throw new Error("No refresh token");
  }

  refreshPromise = axios
    .post<BasicResponse<{ accessToken: string; refreshToken: string }>>(
      `${apiConfig.baseURL}/auth/refresh-token`,
      {},
      { headers: { Authorization: `Bearer ${refresh}` } }
    )
    .then((res) => {
      const data = res.data?.data;
      if (data?.accessToken && data?.refreshToken) {
        // Update both localStorage + cookie + Zustand permissions
        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
      }
      throw new Error("Invalid refresh response");
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

// ── Request interceptor — attach access token ───────────────
client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor — handle 401, refresh, exam-mode ───
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<BasicResponse>) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return client(originalRequest);
      } catch {
        // Refresh failed — clear auth state
        useAuthStore.getState().logout();

        if (typeof window !== "undefined") {
          const isExamRoute = window.location.pathname.startsWith("/exam/");

          if (isExamRoute) {
            // During exams, dispatch a custom event so the exam UI
            // can show an inline re-auth modal instead of hard-redirecting.
            window.dispatchEvent(new CustomEvent("auth:session-expired"));
          } else {
            const redirect = encodeURIComponent(window.location.pathname);
            window.location.href = `/login?redirect=${redirect}`;
          }
        }
        return Promise.reject(error);
      }
    }

    // Extract the most useful error message from the backend response
    const message =
      error.response?.data?.message ||
      (error.response?.data as BasicResponse)?.message ||
      error.message ||
      "Request failed";

    return Promise.reject(new Error(message));
  }
);

export default client;
