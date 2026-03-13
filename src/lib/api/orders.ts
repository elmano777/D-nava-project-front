import { apiFetch } from "./client";

export interface OrderDto {
  pedido_id: number;
  numero_orden: string;
  usuario_id: number | null;
  nombre_cliente: string;
  telefono_cliente: string;
  email_cliente: string;
  tipo_entrega: string;
  direccion_entrega: string | null;
  referencia_entrega: string | null;
  distrito_entrega: string | null;
  ciudad_entrega: string | null;
  codigo_postal_entrega: string | null;
  fecha_hora_programada: string;
  notas_cliente: string | null;
  subtotal: string;
  total: string;
  metodo_pago: string;
  estado_pago: string;
  estado_pedido: string;
  motivo_cancelacion: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string | null;
}

export interface CreateOrderItemPayload {
  producto_id: number;
  cantidad: number;
  personalizacion?: Record<string, unknown>;
}

export interface CreateOrderPayload {
  nombre_cliente: string;
  telefono_cliente: string;
  email_cliente: string;
  tipo_entrega: "delivery" | "recojo" | "recojo_tienda";
  direccion_entrega?: string;
  distrito_entrega?: string;
  fecha_hora_programada: string;
  notas_cliente?: string;
  metodo_pago: "tarjeta" | "contra_entrega";
  costo_delivery?: number;
  items: CreateOrderItemPayload[];
}

export async function createOrderApi(payload: CreateOrderPayload) {
  return apiFetch<OrderDto>("/orders", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export interface ListOrdersResponse {
  data: OrderDto[];
  total: number;
  limit: number | null;
  offset: number;
}

export type OrderEstadoPedido =
  | "recibido"
  | "en_preparacion"
  | "listo"
  | "completado"
  | "cancelado";

export async function listOrdersApi(params?: {
  estado_pedido?: OrderEstadoPedido;
  limit?: number;
  offset?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.estado_pedido)
    searchParams.set("estado_pedido", params.estado_pedido);
  if (params?.limit !== undefined)
    searchParams.set("limit", String(params.limit));
  if (params?.offset !== undefined)
    searchParams.set("offset", String(params.offset));
  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return apiFetch<ListOrdersResponse>(`/orders${query}`, {
    method: "GET",
    auth: true,
  });
}

export async function getOrderApi(id: number) {
  return apiFetch<OrderDto>(`/orders/${id}`, {
    method: "GET",
    auth: true,
  });
}

export async function updateOrderStatusApi(
  id: number,
  data: {
    estado_pedido: OrderEstadoPedido;
    notas?: string;
    motivo_cancelacion?: string;
  },
) {
  return apiFetch<OrderDto>(`/orders/${id}/status`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(data),
  });
}

export async function cancelOrderApi(id: number, motivo?: string) {
  return apiFetch<OrderDto>(`/orders/${id}/cancel`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ motivo_cancelacion: motivo }),
  });
}

export async function updatePaymentMethodApi(
  id: number,
  metodo_pago: "tarjeta" | "yape",
) {
  return apiFetch<OrderDto>(`/orders/${id}/payment-method`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ metodo_pago }),
  });
}

export interface OrderDetailDto {
  detalle_id: number;
  pedido_id: number;
  producto_id: number;
  nombre_producto: string;
  precio_unitario: string;
  cantidad: number;
  subtotal: string;
  personalizacion: Record<string, unknown> | null;
}

export async function getOrderWithDetailsApi(pedidoId: number) {
  return apiFetch<OrderDto & { items: OrderDetailDto[] }>(`/orders/${pedidoId}`, {
    method: "GET",
    auth: true,
  });
}

export async function getOrderByNumberApi(orderNumber: string) {
  return apiFetch<OrderDto | null>(
    `/orders/by-number/${encodeURIComponent(orderNumber)}`,
    {
      method: "GET",
      auth: true,
    },
  );
}

export async function getMyOrderByNumberApi(orderNumber: string) {
  return apiFetch<OrderDto>(
    `/orders/my-order/${encodeURIComponent(orderNumber)}`,
    {
      method: "GET",
      auth: true,
    },
  );
}
