import { apiFetch } from "./client";
import type { CategoryDto } from "./categories";

export interface ProductDto {
  producto_id: number;
  categoria_id: number;
  nombre: string;
  descripcion_breve: string | null;
  descripcion_completa: string | null;
  ingredientes: string | null;
  precio_base: string;
  tiene_personalizacion: boolean;
  opciones_personalizacion: Record<string, unknown> | null;
  control_stock: boolean;
  stock_actual: number | null;
  disponible: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
}

export async function listProductsApi(params?: {
  active?: boolean;
  categoria_id?: number;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.active !== undefined)
    searchParams.set("disponible", String(params.active));
  if (params?.categoria_id !== undefined)
    searchParams.set("categoria_id", String(params.categoria_id));
  if (params?.search) searchParams.set("search", params.search);
  if (params?.limit !== undefined)
    searchParams.set("limit", String(params.limit));
  if (params?.offset !== undefined)
    searchParams.set("offset", String(params.offset));
  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return apiFetch<ProductDto[]>(`/products${query}`, {
    method: "GET",
  });
}

export async function countProductsApi() {
  const products = await listProductsApi({ active: true });
  return products.length;
}

export interface CreateProductPayload {
  categoria_id: number;
  nombre: string;
  descripcion_breve?: string;
  descripcion_completa?: string;
  ingredientes?: string;
  precio_base: number;
  tiene_personalizacion?: boolean;
  opciones_personalizacion?: Record<string, unknown>;
  control_stock?: boolean;
  stock_actual?: number;
  disponible?: boolean;
}

export async function createProductApi(payload: CreateProductPayload) {
  return apiFetch<ProductDto>("/products", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function updateProductApi(
  id: number,
  payload: Partial<CreateProductPayload>,
) {
  return apiFetch<ProductDto>(`/products/${id}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function deleteProductApi(id: number) {
  return apiFetch<void>(`/products/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function updateProductStockApi(id: number, quantity: number) {
  return apiFetch<ProductDto>(`/products/${id}/stock`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ quantity }),
  });
}

export interface ProductImageDto {
  imagen_id: number;
  producto_id: number;
  url_s3: string;
  orden: number;
  fecha_subida: string;
}

export async function uploadProductImageApi(
  productId: number,
  file: File,
): Promise<ProductImageDto> {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<ProductImageDto>(`/aws/product-image/${productId}`, {
    method: "POST",
    auth: true,
    body: formData,
  });
}

export async function deleteImageApi(imageId: number): Promise<void> {
  return apiFetch<void>(`/aws/image/${imageId}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function reorderImageApi(
  imageId: number,
  orden: number,
): Promise<ProductImageDto> {
  return apiFetch<ProductImageDto>(`/aws/image/${imageId}/reorder`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ orden }),
  });
}

export interface ProductWithImagesDto {
  producto_id: number;
  categoria_id: number;
  nombre: string;
  descripcion_breve: string | null;
  descripcion_completa: string | null;
  ingredientes: string | null;
  precio_base: string;
  tiene_personalizacion: boolean;
  opciones_personalizacion: Record<string, unknown> | null;
  control_stock: boolean;
  stock_actual: number | null;
  disponible: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
  categoria?: CategoryDto;
  imagenes?: Array<{
    imagen_id: number;
    url_s3: string;
    orden: number;
  }>;
}

export async function getProductsPublicApi(params?: {
  categoria_id?: number;
  disponible?: boolean;
  busqueda?: string;
  limit?: number;
  offset?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.categoria_id !== undefined)
    searchParams.set("categoria_id", String(params.categoria_id));
  if (params?.disponible !== undefined)
    searchParams.set("disponible", String(params.disponible));
  if (params?.busqueda) searchParams.set("busqueda", params.busqueda);
  if (params?.limit !== undefined)
    searchParams.set("limit", String(params.limit));
  if (params?.offset !== undefined)
    searchParams.set("offset", String(params.offset));
  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return apiFetch<ProductWithImagesDto[]>(`/products${query}`, {
    method: "GET",
  });
}

export async function getProductByIdApi(id: number) {
  return apiFetch<ProductWithImagesDto>(`/products/${id}`, {
    method: "GET",
  });
}
