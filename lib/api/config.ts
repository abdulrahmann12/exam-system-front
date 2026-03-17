/**
 * Centralized API configuration.
 * Base URL should match backend (e.g. http://localhost:7860/api)
 */
const API_BASE_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:7860/api")
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:7860/api";

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

export default apiConfig;
