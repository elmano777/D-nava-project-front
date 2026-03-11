import {
  getAccessToken,
  getRefreshToken,
  saveAuthData,
  clearAuthData,
  isTokenExpiringSoon,
} from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export interface ApiError extends Error {
  status?: number;
  details?: unknown;
}

// Flag para evitar múltiples refresh simultáneos
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

// Health check callback - se setea desde el componente App
let maintenanceModeCallback: (() => void) | null = null;

export function setMaintenanceModeCallback(callback: () => void) {
  maintenanceModeCallback = callback;
}

/**
 * Verifica la salud del backend
 */
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
      consecutiveFailures: 999, // Fallo crítico
    };
  }
}

/**
 * Refresca el access token usando el refresh token
 */
async function refreshAccessToken(): Promise<void> {
  // Si ya hay un refresh en proceso, esperar a que termine
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

      // Llamar al endpoint de refresh directamente sin usar apiFetch para evitar recursión
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

      // Guardar los nuevos tokens
      saveAuthData(data);

      // También actualizar la cookie si es necesario
      if (typeof document !== "undefined") {
        document.cookie = `access_token=${data.access_token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
      }

      console.log("✅ Token refrescado automáticamente");
    } catch (error) {
      console.error("❌ Error al refrescar token:", error);
      // Si el refresh falla, limpiar todo y redirigir al login
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

async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  // Si requiere autenticación y el token está por expirar, refrescarlo primero
  if (options.auth && typeof window !== "undefined") {
    if (isTokenExpiringSoon(5)) {
      // 5 minutos antes de expirar
      try {
        await refreshAccessToken();
      } catch (error) {
        // Si falla el refresh, continuar con el token actual (fallará en el servidor)
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

  // Token JWT almacenado en localStorage (cliente). En server actions no habrá localStorage.
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
    // Error de red (backend apagado, sin conexión, timeout, etc.)
    console.error(
      "❌ Error de red al intentar conectar con el backend:",
      fetchError,
    );

    if (typeof window !== "undefined") {
      // Verificar si es un problema del backend
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
    // Si es 401 (Unauthorized) y requiere auth, intentar refrescar el token y reintentar
    if (res.status === 401 && options.auth && typeof window !== "undefined") {
      try {
        console.log("🔄 Token expirado, intentando refrescar...");
        await refreshAccessToken();

        // Reintentar el request con el nuevo token
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

          // Si el retry también falla, lanzar el error
          const retryError: ApiError = new Error(
            (retryData &&
            typeof retryData === "object" &&
            "message" in retryData
              ? (retryData as any).message
              : "Error en la petición al backend") as string,
          );
          retryError.status = retryRes.status;
          retryError.details = retryData;
          throw retryError;
        }
      } catch (refreshError) {
        console.error("❌ No se pudo refrescar el token:", refreshError);
        // Si falla el refresh, el usuario será redirigido al login automáticamente
      }
    }

    // Si es error 500+ o timeout, verificar salud del backend
    if (res.status >= 500 && typeof window !== "undefined") {
      console.warn("⚠️ Error 500+ detectado, verificando salud del backend...");

      // Verificar health check en background
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
    auth: true, // Requiere autenticación de administrador
    body: JSON.stringify(payload),
  });
}

// ====== Payments (Culqi) ======

// ====== Culqi ======

export interface CulqiOrderResponse {
  order_id: string;
  amount: number;
  currency_code: string;
  state: string;
  qr?: string;
  payment_code?: string;
}

export async function createCulqiOrderApi(pedidoId: number) {
  return apiFetch<CulqiOrderResponse>("/payments/culqi/order", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ pedido_id: pedidoId }),
  });
}

export interface CulqiChargePayload {
  pedido_id: number;
  source_id: string;
  email: string;
}

export interface CulqiChargeResponse {
  charge_id: string;
  outcome_type: string;
  user_message: string;
  amount: number;
  currency: string;
}

export async function createCulqiChargeApi(payload: CulqiChargePayload) {
  return apiFetch<CulqiChargeResponse>("/payments/culqi/charge", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export interface PaymentStatusResponse {
  transaccion_id: number;
  pedido_id: number;
  culqi_charge_id?: string;
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

export interface CulqiRefundPayload {
  pedido_id: number;
  amount?: number; // Opcional para devolución parcial (en centavos)
  reason: "duplicado" | "fraudulento" | "solicitud_comprador";
}

export interface CulqiRefundResponse {
  refund_id: string;
  charge_id: string;
  amount: number;
  reason: string;
  status: string;
  created_at: string;
}

export async function createCulqiRefundApi(payload: CulqiRefundPayload) {
  return apiFetch<CulqiRefundResponse>("/payments/culqi/refund", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

// ====== Legacy Mercado Pago (deprecated) ======

export interface CreatePreferenceResponse {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint?: string | null;
}

// @deprecated - Usar createCulqiChargeApi en su lugar
export async function createPaymentPreferenceApi(pedidoId: number) {
  return apiFetch<CreatePreferenceResponse>("/payments/create-preference", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ pedido_id: pedidoId }),
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
  costo_delivery?: number; // Costo dinámico de delivery en soles
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
  ingresos_totales: string; // Backend devuelve como string
  total_pedidos: number;
  pedidos_completados: number;
  pedidos_cancelados: number;
  ticket_promedio: string; // Backend devuelve como string
  tasa_conversion: number;
}

export async function getSalesStatsApi(period?: string) {
  const query = period ? `?period=${period}` : "";
  return apiFetch<SalesStatsResponse>(`/reports/stats${query}`, {
    method: "GET",
    auth: true,
  });
}

export interface SalesReportItem {
  fecha: string;
  total: number;
  cantidad_pedidos: number;
}

export interface SalesReportResponse {
  total_ventas: number;
  total_pedidos: number;
  promedio_venta: number;
  periodo: string;
  ventas_por_dia: SalesReportItem[];
}

export async function getSalesReportApi(params?: {
  period?: string;
  startDate?: string;
  endDate?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.period) searchParams.set("period", params.period);
  if (params?.startDate) searchParams.set("startDate", params.startDate);
  if (params?.endDate) searchParams.set("endDate", params.endDate);
  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return apiFetch<SalesReportResponse>(`/reports/sales${query}`, {
    method: "GET",
    auth: true,
  });
}

export interface TopProduct {
  producto_id: number;
  nombre_producto: string;
  cantidad_vendida: number;
  total_ingresos: string;
  cantidad_pedidos: number;
}

export async function getTopProductsApi(limit: number = 10) {
  return apiFetch<TopProduct[]>(`/reports/top-products?limit=${limit}`, {
    method: "GET",
    auth: true,
  });
}

export interface ProductSalesReport {
  producto_id: number;
  nombre: string;
  total_vendido: number;
  ingresos_totales: number;
  ventas_por_periodo: Array<{
    fecha: string;
    cantidad: number;
    ingresos: number;
  }>;
}

export async function getProductSalesApi(productId: number) {
  return apiFetch<ProductSalesReport>(`/reports/products/${productId}`, {
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

// ====== Product Images (AWS) ======

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

// ====== Order Lookup (Public) ======

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
  return apiFetch<OrderDto & { items: OrderDetailDto[] }>(
    `/orders/${pedidoId}`,
    {
      method: "GET",
      auth: true,
    },
  );
}

// ====== Addresses ======

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
