"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import {
  listOrdersApi,
  updateOrderStatusApi,
  sendNotificationApi,
  type OrderDto,
  type OrderEstadoPedido,
} from "@/lib/api";

interface OrdersTableProps {}

export function OrdersTable({}: OrdersTableProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const data = await listOrdersApi();
        if (isMounted) setOrders(data);
      } catch (error) {
        console.error("Error cargando pedidos desde backend:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatPrice = (amountString: string) => {
    const amount = Number(amountString);
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(Number.isNaN(amount) ? 0 : amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const mapUiToBackendStatus = (uiStatus: string): OrderEstadoPedido => {
    switch (uiStatus) {
      case "pending":
        return "recibido";
      case "processing":
        return "en_preparacion";
      case "completed":
        return "completado";
      case "cancelled":
        return "cancelado";
      default:
        return "recibido";
    }
  };

  const mapBackendToUiStatus = (estado_pedido: string): string => {
    switch (estado_pedido) {
      case "recibido":
        return "pending";
      case "en_preparacion":
        return "processing";
      case "completado":
      case "listo":
        return "completed";
      case "cancelado":
        return "cancelled";
      default:
        return "pending";
    }
  };

  const handleStatusChange = async (pedidoId: number, newStatus: string) => {
    const backendStatus = mapUiToBackendStatus(newStatus);

    await updateOrderStatusApi(pedidoId, { estado_pedido: backendStatus });

    // Refrescar lista localmente sin recargar página completa
    setOrders((prev) =>
      prev.map((order) =>
        order.pedido_id === pedidoId
          ? { ...order, estado_pedido: backendStatus }
          : order,
      ),
    );
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const paymentBadge = (estado_pago: string) => {
    if (estado_pago === "completado") {
      return {
        label: "Pagado",
        className: "bg-green-100 text-green-800",
      };
    }

    if (estado_pago === "rechazado") {
      return {
        label: "Rechazado",
        className: "bg-red-100 text-red-800",
      };
    }

    return {
      label: "Pendiente",
      className: "bg-yellow-100 text-yellow-800",
    };
  };

  const handleSendNotification = async (order: OrderDto) => {
    try {
      await sendNotificationApi({
        telefono_destino: order.telefono_cliente,
        mensaje: `Hola ${order.nombre_cliente}, tu pedido ${order.numero_orden} está en estado ${order.estado_pedido}.`,
        tipo_notificacion: "actualizacion",
        pedido_id: order.pedido_id,
      });
      alert("Notificación enviada por WhatsApp");
    } catch (error) {
      console.error("Error enviando notificación:", error);
      alert("No se pudo enviar la notificación de WhatsApp");
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Pago</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-muted-foreground"
              >
                Cargando pedidos...
              </TableCell>
            </TableRow>
          ) : orders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-muted-foreground"
              >
                No hay pedidos registrados
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => {
              const uiStatus = mapBackendToUiStatus(order.estado_pedido);
              const payment = paymentBadge(order.estado_pago);

              return (
                <TableRow key={order.pedido_id}>
                  <TableCell className="font-medium">
                    {order.numero_orden}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.nombre_cliente}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.email_cliente}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(order.fecha_creacion)}</TableCell>
                  <TableCell>{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={uiStatus}
                      onValueChange={(value) =>
                        handleStatusChange(order.pedido_id, value)
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="processing">Procesando</SelectItem>
                        <SelectItem value="completed">Completado</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={payment.className}>
                      {payment.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/order/${order.pedido_id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendNotification(order)}
                    >
                      WhatsApp
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
