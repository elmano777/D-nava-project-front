import { apiFetch } from "./client";

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
  amount?: number;
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

export interface CreatePreferenceResponse {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint?: string | null;
}

/** @deprecated Usar createCulqiChargeApi en su lugar */
export async function createPaymentPreferenceApi(pedidoId: number) {
  return apiFetch<CreatePreferenceResponse>("/payments/create-preference", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ pedido_id: pedidoId }),
  });
}
