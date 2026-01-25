const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export interface ApiError extends Error {
  status?: number;
  details?: unknown;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(options.headers || {});

  if (
    !headers.has("Content-Type") &&
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  // Token JWT almacenado en localStorage (cliente). En server actions no habrá localStorage.
  if (options.auth) {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("access_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  let data: unknown = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const error: ApiError = new Error(
      (data && typeof data === "object" && "message" in data
        ? (data as any).message
        : "Error en la petición al backend") as string,
    );
    error.status = res.status;
    error.details = data;
    throw error;
  }

  return data as T;
}

// ====== Auth ======

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

// TODO: si más adelante migras el registro al backend, podrás usar esto
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

// ====== Payments ======

export interface CreatePreferenceResponse {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint?: string | null;
}

export async function createPaymentPreferenceApi(pedidoId: number) {
  return apiFetch<CreatePreferenceResponse>("/payments/create-preference", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ pedido_id: pedidoId }),
  });
}

export interface CreateYapePaymentPayload {
  pedido_id: number;
  token: string;
  email: string;
}

export interface CreateYapePaymentResponse {
  paymentId: number;
  status: string;
  statusDetail?: string;
}

export async function createYapePaymentApi(payload: CreateYapePaymentPayload) {
  return apiFetch<CreateYapePaymentResponse>("/payments/create-yape-payment", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export interface PaymentStatusResponse {
  transaccion_id: number;
  pedido_id: number;
  mercadopago_payment_id: string;
  mercadopago_preference_id: string;
  estado: string;
  metodo_pago: string | null;
  monto: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export async function getPaymentStatusApi(pedidoId: number) {
  return apiFetch<PaymentStatusResponse>(`/payments/${pedidoId}/status`, {
    method: "GET",
    auth: true,
  });
}

// ====== Orders ======

export interface OrderDto {
  pedido_id: number;
  numero_orden: string;
  usuario_id: number | null;
  nombre_cliente: string;
  telefono_cliente: string;
  email_cliente: string;
  tipo_entrega: string;
  direccion_entrega: string | null;
  distrito_entrega: string | null;
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
  items: CreateOrderItemPayload[];
}

export async function createOrderApi(payload: CreateOrderPayload) {
  return apiFetch<OrderDto>("/orders", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function listOrdersApi() {
  return apiFetch<OrderDto[]>("/orders", {
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

export type OrderEstadoPedido =
  | "recibido"
  | "en_preparacion"
  | "listo"
  | "completado"
  | "cancelado";

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

// ====== Notifications ======

export interface NotificationDto {
  notificacion_id: number;
  pedido_id: number;
  telefono_destino: string;
  tipo_notificacion: string;
  mensaje: string;
  id_mensaje_twilio: string | null;
  estado_envio: string;
  fecha_envio: string;
  fecha_entrega: string | null;
  error_mensaje: string | null;
}

export async function getOrderNotificationsApi(pedidoId: number) {
  return apiFetch<NotificationDto[]>(`/notifications/${pedidoId}`, {
    method: "GET",
    auth: true,
  });
}

export type TipoNotificacion =
  | "confirmacion"
  | "actualizacion"
  | "recordatorio"
  | "cancelacion";

export async function sendNotificationApi(payload: {
  telefono_destino: string;
  mensaje: string;
  tipo_notificacion: TipoNotificacion;
  pedido_id: number;
}) {
  return apiFetch<NotificationDto>("/notifications/send", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function sendTestNotificationApi(payload: {
  telefono_destino: string;
}) {
  return apiFetch<NotificationDto>("/notifications/test", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

// ====== Reports ======

export interface SalesStatsResponse {
  total_ingresos: number;
  total_pedidos: number;
  pedidos_completados: number;
  pedidos_cancelados: number;
  ticket_promedio: number;
  tasa_conversion: number;
}

export async function getSalesStatsApi(period?: string) {
  const query = period ? `?period=${period}` : "";
  return apiFetch<SalesStatsResponse>(`/reports/stats${query}`, {
    method: "GET",
    auth: true,
  });
}

// ====== Products (Admin) ======

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
}) {
  const searchParams = new URLSearchParams();
  if (params?.active !== undefined)
    searchParams.set("disponible", String(params.active));
  if (params?.categoria_id !== undefined)
    searchParams.set("categoria_id", String(params.categoria_id));
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

// ====== Categories ======

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

export async function deleteCategoryApi(id: number) {
  return apiFetch<void>(`/categories/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

// ====== Products (Public) ======

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
}) {
  const searchParams = new URLSearchParams();
  if (params?.categoria_id !== undefined)
    searchParams.set("categoria_id", String(params.categoria_id));
  if (params?.disponible !== undefined)
    searchParams.set("disponible", String(params.disponible));
  if (params?.busqueda) searchParams.set("busqueda", params.busqueda);
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

// ====== Order Lookup (Public) ======

export async function getOrderByNumberApi(orderNumber: string) {
  return apiFetch<OrderDto | null>(
    `/orders/${encodeURIComponent(orderNumber)}`,
    {
      method: "GET",
    },
  );
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
  return apiFetch<OrderDto & { detalles: OrderDetailDto[] }>(
    `/orders/${pedidoId}`,
    {
      method: "GET",
      auth: true,
    },
  );
}
