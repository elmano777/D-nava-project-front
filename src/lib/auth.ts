import { AuthResponse, AuthUser } from "./api";

// ====== JWT Payload Type ======
export interface JwtPayload {
  sub: number;
  email: string;
  rol: string;
  nombre_completo: string;
  telefono: string;
  iat: number;
  exp: number;
}

// ====== JWT Decode Helper ======
export function decodeJwt(): JwtPayload | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const base64Payload = token.split(".")[1];
    const payload = JSON.parse(atob(base64Payload));
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

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

// ====== Token Expiration Checks ======

/**
 * Verifica si el token de acceso está expirado
 */
export function isTokenExpired(): boolean {
  const payload = decodeJwt();
  if (!payload) return true;

  const now = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
  return payload.exp <= now;
}

/**
 * Verifica si el token está por expirar en los próximos minutos
 * @param minutesBeforeExpiry - Minutos antes de la expiración (default: 5)
 */
export function isTokenExpiringSoon(minutesBeforeExpiry: number = 5): boolean {
  const payload = decodeJwt();
  if (!payload) return true;

  const now = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
  const bufferTime = minutesBeforeExpiry * 60; // Convertir minutos a segundos
  return payload.exp - now <= bufferTime;
}

/**
 * Obtiene el tiempo restante hasta la expiración del token (en segundos)
 */
export function getTokenTimeToExpiry(): number | null {
  const payload = decodeJwt();
  if (!payload) return null;

  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - now);
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
