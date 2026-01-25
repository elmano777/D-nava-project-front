import { AuthResponse, AuthUser } from "./api";

const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "backend_user";

// ====== Token Management ======

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as AuthUser;
  } catch {
    return null;
  }
}

export function saveAuthData(authResponse: AuthResponse): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, authResponse.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, authResponse.refresh_token);
  localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
}

export function clearAuthData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function isAdmin(): boolean {
  const user = getStoredUser();
  return user?.rol === "administrador";
}

// ====== Cookie helpers for middleware (server-side) ======

export function setAuthCookies(authResponse: AuthResponse): string[] {
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  return [
    `${TOKEN_KEY}=${authResponse.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`,
    `${USER_KEY}=${encodeURIComponent(JSON.stringify(authResponse.user))}; Path=/; SameSite=Lax; Max-Age=${maxAge}`,
  ];
}

export function parseUserFromCookie(
  cookieValue: string | undefined,
): AuthUser | null {
  if (!cookieValue) return null;
  try {
    return JSON.parse(decodeURIComponent(cookieValue)) as AuthUser;
  } catch {
    return null;
  }
}
