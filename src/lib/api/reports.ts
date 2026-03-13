import { apiFetch } from "./client";

export interface SalesStatsResponse {
  ingresos_totales: string;
  total_pedidos: number;
  pedidos_completados: number;
  pedidos_cancelados: number;
  ticket_promedio: string;
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
