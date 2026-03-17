const ACCESS_TOKEN_KEY = "exam_access_token";
const REFRESH_TOKEN_KEY = "exam_refresh_token";
const SESSION_COOKIE = "has_session";

function setSessionCookie(active: boolean): void {
  if (typeof document === "undefined") return;
  if (active) {
    // SameSite=Lax so middleware can read it on navigations; not HttpOnly so JS can set it
    document.cookie = `${SESSION_COOKIE}=1; path=/; SameSite=Lax`;
  } else {
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  setSessionCookie(true);
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  setSessionCookie(false);
}

export function hasTokens(): boolean {
  return !!(getAccessToken() && getRefreshToken());
}
