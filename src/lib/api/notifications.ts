import { apiFetch } from "./client";

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

export type TipoNotificacion =
  | "confirmacion"
  | "actualizacion"
  | "recordatorio"
  | "cancelacion";

export async function getOrderNotificationsApi(pedidoId: number) {
  return apiFetch<NotificationDto[]>(`/notifications/${pedidoId}`, {
    method: "GET",
    auth: true,
  });
}

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
