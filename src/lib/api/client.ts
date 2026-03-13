import {
  getAccessToken,
  getRefreshToken,
  saveAuthData,
  clearAuthData,
  isTokenExpiringSoon,
} from "../auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export interface ApiError extends Error {
  status?: number;
  details?: unknown;
}

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

let maintenanceModeCallback: (() => void) | null = null;

export function setMaintenanceModeCallback(callback: () => void) {
  maintenanceModeCallback = callback;
}

export async function checkBackendHealth(): Promise<{
  status: "ok" | "degraded" | "unknown";
  consecutiveFailures: number;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    return {
      status: data.status || "unknown",
      consecutiveFailures: data.database?.consecutiveFailures || 0,
    };
  } catch (error) {
    console.error("❌ Health check falló:", error);
    return {
      status: "degraded",
      consecutiveFailures: 999,
    };
  }
}

async function refreshAccessToken(): Promise<void> {
  if (isRefreshing && refreshPromise) {
    await refreshPromise;
    return;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();
      saveAuthData(data);

      if (typeof document !== "undefined") {
        document.cookie = `access_token=${data.access_token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
      }

      console.log("✅ Token refrescado automáticamente");
    } catch (error) {
      console.error("❌ Error al refrescar token:", error);
      clearAuthData();
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  await refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  if (options.auth && typeof window !== "undefined") {
    if (isTokenExpiringSoon(5)) {
      try {
        await refreshAccessToken();
      } catch (error) {
        console.error("Error al refrescar token antes del request:", error);
      }
    }
  }

  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(options.headers || {});

  if (
    !headers.has("Content-Type") &&
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth) {
    if (typeof window !== "undefined") {
      const token = getAccessToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
  }

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch (fetchError) {
    console.error(
      "❌ Error de red al intentar conectar con el backend:",
      fetchError,
    );

    if (typeof window !== "undefined") {
      const health = await checkBackendHealth().catch(() => ({
        status: "degraded" as const,
        consecutiveFailures: 999,
      }));

      if (health.status === "degraded" && maintenanceModeCallback) {
        console.error("🔧 Backend no responde, activando modo mantenimiento");
        maintenanceModeCallback();
      }
    }

    const error: ApiError = new Error(
      "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
    );
    error.status = 0;
    error.details = fetchError;
    throw error;
  }

  let data: unknown = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    if (res.status === 401 && options.auth && typeof window !== "undefined") {
      try {
        console.log("🔄 Token expirado, intentando refrescar...");
        await refreshAccessToken();

        const newToken = getAccessToken();
        if (newToken) {
          headers.set("Authorization", `Bearer ${newToken}`);
          const retryRes = await fetch(url, {
            ...options,
            headers,
          });

          const retryText = await retryRes.text();
          let retryData: unknown = null;
          try {
            retryData = retryText ? JSON.parse(retryText) : null;
          } catch {
            retryData = retryText;
          }

          if (retryRes.ok) {
            console.log("✅ Request exitoso después de refrescar token");
            return retryData as T;
          }

          const retryError: ApiError = new Error(
            (retryData &&
            typeof retryData === "object" &&
            "message" in retryData
              ? (retryData as { message: string }).message
              : "Error en la petición al backend") as string,
          );
          retryError.status = retryRes.status;
          retryError.details = retryData;
          throw retryError;
        }
      } catch (refreshError) {
        console.error("❌ No se pudo refrescar el token:", refreshError);
      }
    }

    if (res.status >= 500 && typeof window !== "undefined") {
      console.warn("⚠️ Error 500+ detectado, verificando salud del backend...");

      checkBackendHealth()
        .then((health) => {
          if (health.status === "degraded" && maintenanceModeCallback) {
            console.error("🔧 Backend degradado, activando modo mantenimiento");
            maintenanceModeCallback();
          }
        })
        .catch((err) => {
          console.error("Error verificando health check:", err);
        });
    }

    const error: ApiError = new Error(
      (data && typeof data === "object" && "message" in data
        ? (data as { message: string }).message
        : "Error en la petición al backend") as string,
    );
    error.status = res.status;
    error.details = data;
    throw error;
  }

  return data as T;
}
