"use client";

import { useEffect, useState } from "react";
import { ClienteNav } from "@/components/cliente/cliente-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listOrdersApi, OrderDto } from "@/lib/api";
import { Loader2, Package, Eye } from "lucide-react";
import Link from "next/link";

const statusConfig: Record<string, { label: string; color: string }> = {
  recibido: { label: "Recibido", color: "bg-yellow-100 text-yellow-800" },
  en_preparacion: {
    label: "En Preparación",
    color: "bg-blue-100 text-blue-800",
  },
  listo: { label: "Listo", color: "bg-green-100 text-green-800" },
  completado: { label: "Completado", color: "bg-green-100 text-green-800" },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800" },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  pendiente: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  pagado: { label: "Pagado", color: "bg-green-100 text-green-800" },
  completado: { label: "Completado", color: "bg-green-100 text-green-800" },
  procesando: { label: "Procesando", color: "bg-blue-100 text-blue-800" },
  rechazado: { label: "Rechazado", color: "bg-red-100 text-red-800" },
};

export default function MisPedidosPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await listOrdersApi();
        setOrders(data);
      } catch (err) {
        console.error("Error cargando pedidos:", err);
        setError("No se pudieron cargar tus pedidos");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <ClienteNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mis Pedidos</h1>
          <p className="text-muted-foreground">
            Historial de todos tus pedidos realizados
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No tienes pedidos aún
              </h3>
              <p className="text-muted-foreground mb-4">
                ¡Haz tu primer pedido hoy!
              </p>
              <Button asChild>
                <Link href="/cliente">Ver Productos</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status =
                statusConfig[order.estado_pedido] || statusConfig.recibido;
              const paymentStatus =
                paymentStatusConfig[order.estado_pago] ||
                paymentStatusConfig.pendiente;

              return (
                <Card key={order.pedido_id}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg">
                          {order.numero_orden}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.fecha_creacion)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={status.color} variant="secondary">
                          {status.label}
                        </Badge>
                        <Badge
                          className={paymentStatus.color}
                          variant="secondary"
                        >
                          Pago: {paymentStatus.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Tipo: {order.tipo_entrega.replace("_", " ")}
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/cliente/pedido/${order.pedido_id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
