import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
  sub: string;
  role: string;
  permissions: string[];
  exp: number;
  iat: number;
}

/**
 * Decode a JWT and extract the typed payload.
 * Returns `null` if the token is malformed or expired.
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Extract permissions array from an access token. */
export function extractPermissions(token: string): string[] {
  return decodeToken(token)?.permissions ?? [];
}

/** Extract the role string from an access token. */
export function extractRole(token: string): string | null {
  return decodeToken(token)?.role ?? null;
}

/** Check if the token is expired (or will expire within `bufferMs`). */
export function isTokenExpired(token: string, bufferMs = 0): boolean {
  try {
    const { exp } = jwtDecode<{ exp: number }>(token);
    return exp * 1000 - bufferMs < Date.now();
  } catch {
    return true;
  }
}
