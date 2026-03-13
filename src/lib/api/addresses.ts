import { apiFetch } from "./client";

export interface AddressDto {
  direccion_id: number;
  usuario_id: number;
  alias: string;
  direccion_linea1: string;
  direccion_linea2: string | null;
  distrito: string;
  ciudad: string;
  codigo_postal: string;
  es_predeterminada: boolean;
  es_temporal: boolean;
  fecha_creacion: string;
  fecha_modificacion?: string;
}

export async function getAddressesApi() {
  return apiFetch<AddressDto[]>("/users/me/addresses", {
    method: "GET",
    auth: true,
  });
}

export async function createAddressApi(payload: {
  alias?: string;
  direccion_linea1: string;
  direccion_linea2?: string;
  distrito: string;
  ciudad: string;
  codigo_postal?: string;
  es_predeterminada?: boolean;
  es_temporal?: boolean;
}) {
  return apiFetch<AddressDto>("/users/me/addresses", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: true,
  });
}

export async function updateAddressApi(
  addressId: number,
  payload: Partial<{
    alias: string;
    direccion_linea1: string;
    direccion_linea2: string;
    distrito: string;
    ciudad: string;
    codigo_postal: string;
    es_predeterminada: boolean;
  }>,
) {
  return apiFetch<AddressDto>(`/users/me/addresses/${addressId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    auth: true,
  });
}

export async function deleteAddressApi(addressId: number) {
  return apiFetch<void>(`/users/me/addresses/${addressId}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function setDefaultAddressApi(addressId: number) {
  return apiFetch<AddressDto>(`/users/me/addresses/${addressId}/set-default`, {
    method: "POST",
    auth: true,
  });
}
