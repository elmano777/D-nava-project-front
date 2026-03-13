import { apiFetch } from "./client";

export interface AuthUser {
  usuario_id: number;
  email: string;
  nombre_completo: string;
  telefono?: string;
  rol: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export async function loginApi(email: string, password: string) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerApi(payload: {
  email: string;
  password: string;
  nombre_completo: string;
  telefono?: string;
}) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function sendVerificationCodeApi(email: string) {
  return apiFetch<{ message: string }>("/auth/send-verification-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function confirmEmailApi(email: string, codigo: string) {
  return apiFetch<{ message: string }>("/auth/confirm-email", {
    method: "POST",
    body: JSON.stringify({ email, codigo }),
  });
}

export interface ProfileResponse extends AuthUser {
  fecha_creacion?: string;
  email_verificado?: boolean;
}

export async function getProfileApi() {
  return apiFetch<ProfileResponse>("/auth/profile", {
    method: "GET",
    auth: true,
  });
}

export async function updateProfileApi(payload: {
  nombre_completo?: string;
  telefono?: string;
}) {
  return apiFetch<ProfileResponse>("/auth/profile", {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function changePasswordApi(payload: {
  password_actual: string;
  nueva_password: string;
}) {
  return apiFetch<{ message: string }>("/auth/change-password", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function forgotPasswordApi(email: string) {
  return apiFetch<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPasswordApi(token: string, nueva_password: string) {
  return apiFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, nueva_password }),
  });
}

export async function refreshTokenApi(refresh_token: string) {
  return apiFetch<AuthResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token }),
  });
}

export async function registerAdminApi(payload: {
  email: string;
  password: string;
  nombre_completo: string;
  telefono?: string;
}) {
  return apiFetch<AuthResponse>("/auth/register/admin", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}
