import { apiFetch } from "./client";

export interface CategoryDto {
  categoria_id: number;
  nombre: string;
  descripcion: string | null;
  orden: number;
  activa: boolean;
  fecha_creacion: string;
}

export async function listCategoriesApi(params?: { active?: boolean }) {
  const query = params?.active !== undefined ? `?active=${params.active}` : "";
  return apiFetch<CategoryDto[]>(`/categories${query}`, {
    method: "GET",
    auth: true,
  });
}

export async function getCategoryByIdApi(id: number) {
  return apiFetch<CategoryDto>(`/categories/${id}`, {
    method: "GET",
    auth: true,
  });
}

export async function listCategoriesPublicApi(params?: { active?: boolean }) {
  const query = params?.active !== undefined ? `?active=${params.active}` : "";
  return apiFetch<CategoryDto[]>(`/categories${query}`, {
    method: "GET",
  });
}

export interface CreateCategoryPayload {
  nombre: string;
  descripcion?: string;
  activa?: boolean;
}

export async function createCategoryApi(payload: CreateCategoryPayload) {
  return apiFetch<CategoryDto>("/categories", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function updateCategoryApi(
  id: number,
  payload: Partial<CreateCategoryPayload>,
) {
  return apiFetch<CategoryDto>(`/categories/${id}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function toggleCategoryActiveApi(id: number, activa: boolean) {
  return apiFetch<CategoryDto>(`/categories/${id}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ activa }),
  });
}

export async function deleteCategoryApi(id: number) {
  return apiFetch<void>(`/categories/${id}`, {
    method: "DELETE",
    auth: true,
  });
}
