"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Truck,
} from "lucide-react";
import {
  getOrderWithDetailsApi,
  updateOrderStatusApi,
  cancelOrderApi,
  OrderDto,
  OrderDetailDto,
  OrderEstadoPedido,
} from "@/lib/api";
import Link from "next/link";
import { formatCurrencyPEN, formatDateTimeLongPE } from "@/lib/format";

interface OrderHistorialDto {
  historial_id: number;
  estado_anterior: string | null;
  estado_nuevo: string;
  notas: string | null;
  fecha_cambio: string;
}

type OrderWithDetails = OrderDto & {
  items: OrderDetailDto[];
  historial?: OrderHistorialDto[];
};

const statusConfig: Record<
  string,
  { label: string; icon: typeof Clock; color: string }
> = {
  recibido: {
    label: "Recibido",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800",
  },
  en_preparacion: {
    label: "En Preparación",
    icon: Package,
    color: "bg-blue-100 text-blue-800",
  },
  listo: {
    label: "Listo para Recoger",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-800",
  },
  completado: {
    label: "Completado",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-800",
  },
  cancelado: {
    label: "Cancelado",
    icon: XCircle,
    color: "bg-red-100 text-red-800",
  },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  pendiente: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  pagado: { label: "Pagado", color: "bg-green-100 text-green-800" },
  completado: { label: "Completado", color: "bg-green-100 text-green-800" },
  procesando: { label: "Procesando", color: "bg-blue-100 text-blue-800" },
  rechazado: { label: "Rechazado", color: "bg-red-100 text-red-800" },
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const pedidoId = parseInt(id, 10);
        if (isNaN(pedidoId)) {
          setError("ID de pedido inválido");
          return;
        }
        const orderData = await getOrderWithDetailsApi(pedidoId);
        setOrder(orderData);
      } catch (err) {
        console.error("Error cargando pedido:", err);
        setError("Pedido no encontrado");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  const getValidNextStatuses = (currentStatus: string): string[] => {
    switch (currentStatus) {
      case "recibido":
        return ["en_preparacion", "cancelado"];
      case "en_preparacion":
        return ["listo", "cancelado"];
      case "listo":
        return ["completado"];
      case "completado":
        return []; // No se puede cambiar desde completado
      case "cancelado":
        return []; // No se puede cambiar desde cancelado
      default:
        return [
          "recibido",
          "en_preparacion",
          "listo",
          "completado",
          "cancelado",
        ];
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;

    // Si se está cancelando el pedido, confirmar con el admin
    if (newStatus === "cancelado") {
      const confirmed = window.confirm(
        "¿Estás seguro de cancelar este pedido?\n\n" +
          "Si el cliente ya pagó con tarjeta/Yape, se procesará automáticamente el reembolso.",
      );
      if (!confirmed) return;
    }

    setIsUpdating(true);
    try {
      // Si se está cancelando, usar el endpoint de cancelación que procesa refund automáticamente
      if (newStatus === "cancelado") {
        const updated = await cancelOrderApi(
          order.pedido_id,
          "Cancelado por el administrador",
        );
        setOrder({ ...order, ...updated });
        alert(
          "Pedido cancelado exitosamente. El reembolso (si aplica) será procesado automáticamente en 1-30 días.",
        );
      } else {
        // Para otros cambios de estado, usar el endpoint normal
        const updated = await updateOrderStatusApi(order.pedido_id, {
          estado_pedido: newStatus as OrderEstadoPedido,
        });
        setOrder({ ...order, ...updated });
      }
    } catch (err) {
      console.error("Error actualizando estado:", err);
      alert("Error al actualizar el estado del pedido. Intenta nuevamente.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-2">Pedido no encontrado</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link href="/admin/orders">Volver a Pedidos</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const statusInfo = statusConfig[order.estado_pedido] || statusConfig.recibido;
  const paymentInfo =
    paymentStatusConfig[order.estado_pago] || paymentStatusConfig.pendiente;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Pedidos
              </Link>
            </Button>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Pedido #{order.pedido_id}</h1>
              <p className="text-muted-foreground">{order.numero_orden}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge
                className={`${statusInfo.color} px-4 py-2 text-sm font-semibold`}
                variant="secondary"
              >
                <StatusIcon className="h-4 w-4 mr-2" />
                {statusInfo.label}
              </Badge>
              <Badge
                className={`${paymentInfo.color} px-4 py-2 text-sm font-semibold`}
                variant="secondary"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {paymentInfo.label}
              </Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Columna izquierda - Info principal */}
            <div className="md:col-span-2 space-y-6">
              {/* Productos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Productos ({order.items?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items?.map((item) => (
                      <div
                        key={item.detalle_id}
                        className="flex justify-between items-center py-3 border-b last:border-0"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.nombre_producto}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.cantidad} x{" "}
                            {formatCurrencyPEN(item.precio_unitario)}
                          </p>
                          {item.personalizacion && (
                            <p className="text-sm text-muted-foreground italic">
                              {JSON.stringify(item.personalizacion)}
                            </p>
                          )}
                        </div>
                        <p className="font-semibold">
                          {formatCurrencyPEN(item.subtotal)}
                        </p>
                      </div>
                    ))}
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between pt-2">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">
                          {formatCurrencyPEN(order.subtotal)}
                        </span>
                      </div>
                      {order.tipo_entrega === "delivery" &&
                        parseFloat(order.total) >
                          parseFloat(order.subtotal) && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Delivery
                            </span>
                            <span className="font-medium">
                              {formatCurrencyPEN(
                                String(
                                  parseFloat(order.total) -
                                    parseFloat(order.subtotal),
                                ),
                              )}
                            </span>
                          </div>
                        )}
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">
                          {formatCurrencyPEN(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Historial */}
              {order.historial && order.historial.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Historial
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {order.historial.map((h) => (
                        <div
                          key={h.historial_id}
                          className="flex items-start gap-3 pb-3 border-b last:border-0"
                        >
                          <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                          <div className="flex-1">
                            <p className="font-medium">
                              {h.estado_anterior
                                ? `${h.estado_anterior} → ${h.estado_nuevo}`
                                : h.estado_nuevo}
                            </p>
                            {h.notas && (
                              <p className="text-sm text-muted-foreground">
                                {h.notas}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {formatDateTimeLongPE(h.fecha_cambio)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Columna derecha - Acciones y cliente */}
            <div className="space-y-6">
              {/* Cambiar estado */}
              <Card>
                <CardHeader>
                  <CardTitle>Cambiar Estado</CardTitle>
                </CardHeader>
                <CardContent>
                  {getValidNextStatuses(order.estado_pedido).length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No se puede cambiar el estado desde {statusInfo.label}
                    </div>
                  ) : (
                    <Select
                      value={order.estado_pedido}
                      onValueChange={handleStatusChange}
                      disabled={isUpdating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getValidNextStatuses(order.estado_pedido).includes(
                          "recibido",
                        ) && <SelectItem value="recibido">Recibido</SelectItem>}
                        {getValidNextStatuses(order.estado_pedido).includes(
                          "en_preparacion",
                        ) && (
                          <SelectItem value="en_preparacion">
                            En Preparación
                          </SelectItem>
                        )}
                        {getValidNextStatuses(order.estado_pedido).includes(
                          "listo",
                        ) && (
                          <SelectItem value="listo">
                            Listo para Recoger
                          </SelectItem>
                        )}
                        {getValidNextStatuses(order.estado_pedido).includes(
                          "completado",
                        ) && (
                          <SelectItem value="completado">Completado</SelectItem>
                        )}
                        {getValidNextStatuses(order.estado_pedido).includes(
                          "cancelado",
                        ) && (
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </CardContent>
              </Card>

              {/* Info del cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{order.nombre_cliente}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{order.email_cliente}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{order.telefono_cliente}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Info de entrega */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium capitalize">
                      {order.tipo_entrega.replace("_", " ")}
                    </p>
                  </div>
                  {order.direccion_entrega && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Dirección de entrega
                      </p>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="text-sm space-y-1">
                          <p className="font-medium">
                            {order.direccion_entrega}
                          </p>
                          {order.referencia_entrega && (
                            <p className="text-muted-foreground">
                              {order.referencia_entrega}
                            </p>
                          )}
                          <p className="text-muted-foreground">
                            {order.distrito_entrega},{" "}
                            {order.ciudad_entrega || "Lima"}
                          </p>
                          {order.codigo_postal_entrega && (
                            <p className="text-muted-foreground">
                              CP: {order.codigo_postal_entrega}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {order.notas_cliente && (
                    <div>
                      <p className="text-sm text-muted-foreground">Notas</p>
                      <p className="text-sm">{order.notas_cliente}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Info adicional */}
              <Card>
                <CardHeader>
                  <CardTitle>Información</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Método de pago
                    </span>
                    <span className="capitalize">{order.metodo_pago}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Creado</span>
                    <span>{formatDateTimeLongPE(order.fecha_creacion)}</span>
                  </div>
                  {order.fecha_actualizacion && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Actualizado</span>
                      <span>
                        {formatDateTimeLongPE(order.fecha_actualizacion)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
