"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ClienteNav } from "@/components/cliente/cliente-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import {
  getOrderWithDetailsApi,
  OrderDto,
  OrderDetailDto,
  cancelOrderApi,
  createCulqiRefundApi,
  getPaymentStatusApi,
} from "@/lib/api";

interface OrderHistorial {
  historial_id: number;
  estado_anterior: string | null;
  estado_nuevo: string;
  notas: string | null;
  fecha_cambio: string;
}

type OrderWithDetails = OrderDto & {
  items: OrderDetailDto[];
  historial: OrderHistorial[];
};
import Link from "next/link";

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

export default function PedidoDetallePage() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

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

  const handleCancelOrder = async () => {
    if (!order) return;

    const confirmed = window.confirm(
      "¿Estás seguro de que quieres cancelar este pedido?",
    );
    if (!confirmed) return;

    setIsCanceling(true);
    setCancelError(null);

    try {
      // 1. Verificar si el pedido tiene un pago exitoso con Culqi
      let shouldRefund = false;
      if (
        order.estado_pago === "pagado" ||
        order.estado_pago === "completado"
      ) {
        try {
          const paymentStatus = await getPaymentStatusApi(order.pedido_id);
          shouldRefund =
            !!paymentStatus.culqi_charge_id &&
            (paymentStatus.metodo_pago === "tarjeta" ||
              paymentStatus.metodo_pago === "yape");
        } catch (err) {
          console.warn("No se pudo verificar el estado del pago:", err);
        }
      }

      // 2. Si hay que hacer refund, hacerlo primero
      if (shouldRefund) {
        try {
          await createCulqiRefundApi({
            pedido_id: order.pedido_id,
            reason: "solicitud_comprador",
          });
          console.log("Devolución procesada exitosamente");
        } catch (refundErr: any) {
          console.error("Error al procesar devolución:", refundErr);
          // Continuar con la cancelación aunque falle el refund
          // El admin puede procesar el refund manualmente
        }
      }

      // 3. Cancelar el pedido
      await cancelOrderApi(
        order.pedido_id,
        "Cancelado por el cliente desde el portal",
      );

      // 4. Recargar el pedido para mostrar el estado actualizado
      const updatedOrder = await getOrderWithDetailsApi(order.pedido_id);
      setOrder(updatedOrder);

      alert(
        shouldRefund
          ? "Pedido cancelado. La devolución será procesada en 1-30 días según tu banco."
          : "Pedido cancelado exitosamente.",
      );
    } catch (err: any) {
      console.error("Error al cancelar pedido:", err);
      setCancelError(
        err.message || "No se pudo cancelar el pedido. Inténtalo de nuevo.",
      );
    } finally {
      setIsCanceling(false);
    }
  };

  const formatPrice = (price: string | number) => {
    const amount = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <ClienteNav />
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
        <ClienteNav />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-2">Pedido no encontrado</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link href="/cliente/mis-pedidos">Volver a Mis Pedidos</Link>
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
      <ClienteNav />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/cliente/mis-pedidos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Mis Pedidos
            </Link>
          </Button>

          <div>
            <h1 className="text-3xl font-bold mb-2">Detalle del Pedido</h1>
            <p className="text-muted-foreground">{order.numero_orden}</p>
          </div>

          {/* Estado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusIcon className="h-5 w-5" />
                Estado Actual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Badge
                  className={`${statusInfo.color} px-4 py-2 text-sm font-semibold`}
                  variant="secondary"
                >
                  {statusInfo.label}
                </Badge>
                <Badge
                  className={`${paymentInfo.color} px-4 py-2 text-sm font-semibold`}
                  variant="secondary"
                >
                  Pago: {paymentInfo.label}
                </Badge>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Fecha del Pedido
                  </p>
                  <p className="font-medium">
                    {formatDate(order.fecha_creacion)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total</p>
                  <p className="font-bold text-lg text-primary">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancelación del pedido */}
          {order.estado_pedido !== "cancelado" &&
            order.estado_pedido !== "completado" && (
              <Card>
                <CardContent className="pt-6">
                  {order.estado_pedido === "recibido" ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Puedes cancelar tu pedido mientras esté en estado
                        &quot;Recibido&quot;. Si ya realizaste el pago, la
                        devolución será procesada automáticamente.
                      </p>
                      {cancelError && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
                          {cancelError}
                        </div>
                      )}
                      <Button
                        variant="destructive"
                        onClick={handleCancelOrder}
                        disabled={isCanceling}
                        className="w-full sm:w-auto"
                      >
                        {isCanceling ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Cancelando...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancelar Pedido
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Tu pedido ya está en proceso. Para cancelarlo, por favor
                        contáctanos por WhatsApp.
                      </p>
                      <Button
                        variant="outline"
                        asChild
                        className="w-full sm:w-auto"
                      >
                        <a
                          href="https://wa.me/51940241024?text=Hola,%20necesito%20cancelar%20mi%20pedido"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contactar por WhatsApp
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          {/* Productos */}
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div
                    key={item.detalle_id}
                    className="flex justify-between items-center py-3 border-b last:border-0"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{item.nombre_producto}</p>
                      <p className="text-sm text-muted-foreground">
                        Cantidad: {item.cantidad} &middot; Precio unit.:{" "}
                        {formatPrice(item.precio_unitario)}
                      </p>
                      {item.personalizacion && (
                        <p className="text-xs text-muted-foreground italic">
                          Personalización:{" "}
                          {Object.entries(item.personalizacion)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold text-right">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                ))}
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  {order.tipo_entrega === "delivery" &&
                    parseFloat(order.total) > parseFloat(order.subtotal) && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery</span>
                        <span>
                          {formatPrice(
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
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de entrega */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Tipo de Entrega
                  </p>
                  <p className="font-medium capitalize">
                    {order.tipo_entrega === "delivery"
                      ? "Delivery"
                      : "Recojo en tienda"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Método de Pago
                  </p>
                  <p className="font-medium capitalize">{order.metodo_pago}</p>
                </div>
              </div>
              {order.direccion_entrega && (
                <div>
                  <p className="text-sm text-muted-foreground">Dirección</p>
                  <p className="font-medium">
                    {order.direccion_entrega}
                    {order.distrito_entrega && `, ${order.distrito_entrega}`}
                  </p>
                </div>
              )}
              {order.notas_cliente && (
                <div>
                  <p className="text-sm text-muted-foreground">Notas</p>
                  <p className="font-medium">{order.notas_cliente}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historial */}
          {order.historial && order.historial.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historial del Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.historial.map((h) => {
                    const info =
                      statusConfig[h.estado_nuevo] || statusConfig.recibido;
                    return (
                      <div
                        key={h.historial_id}
                        className="flex items-start gap-3"
                      >
                        <div
                          className={`mt-0.5 rounded-full p-1.5 ${info.color}`}
                        >
                          <info.icon className="h-3 w-3" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{info.label}</p>
                          {h.notas && (
                            <p className="text-xs text-muted-foreground">
                              {h.notas}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {formatDate(h.fecha_cambio)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
