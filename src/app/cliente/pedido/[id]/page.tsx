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
} from "lucide-react";
import { getOrderWithDetailsApi, OrderDto, OrderDetailDto } from "@/lib/api";

type OrderWithDetails = OrderDto & {
  detalles: OrderDetailDto[];
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

          {/* Productos */}
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.detalles?.map((item) => (
                  <div
                    key={item.detalle_id}
                    className="flex justify-between items-center py-2"
                  >
                    <div>
                      <p className="font-medium">{item.nombre_producto}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.cantidad} x {formatPrice(item.precio_unitario)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatPrice(order.total)}
                  </span>
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
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Entrega</p>
                <p className="font-medium capitalize">
                  {order.tipo_entrega.replace("_", " ")}
                </p>
              </div>
              {order.direccion_entrega && (
                <div>
                  <p className="text-sm text-muted-foreground">Dirección</p>
                  <p className="font-medium">{order.direccion_entrega}</p>
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
        </div>
      </main>
    </div>
  );
}
