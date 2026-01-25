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
import { getOrderApi, updateOrderStatusApi, OrderDto } from "@/lib/api";
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
  procesando: { label: "Procesando", color: "bg-blue-100 text-blue-800" },
  rechazado: { label: "Rechazado", color: "bg-red-100 text-red-800" },
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<OrderDto | null>(null);
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
        const orderData = await getOrderApi(pedidoId);
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

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;

    setIsUpdating(true);
    try {
      const updated = await updateOrderStatusApi(order.pedido_id, newStatus);
      setOrder(updated);
    } catch (err) {
      console.error("Error actualizando estado:", err);
    } finally {
      setIsUpdating(false);
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
                            {item.cantidad} x {formatPrice(item.precio_unitario)}
                          </p>
                          {item.personalizacion && (
                            <p className="text-sm text-muted-foreground italic">
                              {item.personalizacion}
                            </p>
                          )}
                        </div>
                        <p className="font-semibold">
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between pt-2">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        {formatPrice(order.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        {formatPrice(order.total)}
                      </span>
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
                              {formatDate(h.fecha_cambio)}
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
                  <Select
                    value={order.estado_pedido}
                    onValueChange={handleStatusChange}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recibido">Recibido</SelectItem>
                      <SelectItem value="en_preparacion">
                        En Preparación
                      </SelectItem>
                      <SelectItem value="listo">Listo para Recoger</SelectItem>
                      <SelectItem value="completado">Completado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{order.direccion_entrega}</span>
                    </div>
                  )}
                  {order.fecha_hora_programada && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Fecha programada
                      </p>
                      <p className="font-medium">
                        {formatDate(order.fecha_hora_programada)}
                      </p>
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
                    <span className="text-muted-foreground">Método de pago</span>
                    <span className="capitalize">{order.metodo_pago}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Creado</span>
                    <span>{formatDate(order.fecha_creacion)}</span>
                  </div>
                  {order.fecha_actualizacion && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Actualizado</span>
                      <span>{formatDate(order.fecha_actualizacion)}</span>
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
