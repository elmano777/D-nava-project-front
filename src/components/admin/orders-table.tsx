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
import { Eye, Calendar } from "lucide-react";
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

type FilterType = "today" | "1d" | "2d" | "custom";

export function OrdersTable({}: OrdersTableProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>("today");
  const [customDate, setCustomDate] = useState<string>("");

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
      case "ready":
        return "listo";
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
      case "listo":
        return "ready";
      case "completado":
        return "completed";
      case "cancelado":
        return "cancelled";
      default:
        return "pending";
    }
  };

  const getValidNextStatuses = (currentStatus: string): string[] => {
    switch (currentStatus) {
      case "recibido":
        return ["processing", "cancelled"];
      case "en_preparacion":
        return ["ready", "cancelled"];
      case "listo":
        return ["completed"];
      case "completado":
        return []; // No se puede cambiar desde completado
      case "cancelado":
        return []; // No se puede cambiar desde cancelado
      default:
        return ["pending", "processing", "ready", "completed", "cancelled"];
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

  const statusBadge = (estado_pedido: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      recibido: {
        label: "Recibido",
        className: "bg-yellow-100 text-yellow-800",
      },
      en_preparacion: {
        label: "En Preparación",
        className: "bg-blue-100 text-blue-800",
      },
      listo: { label: "Listo", className: "bg-green-100 text-green-800" },
      completado: {
        label: "Completado",
        className: "bg-green-100 text-green-800",
      },
      cancelado: { label: "Cancelado", className: "bg-red-100 text-red-800" },
    };
    return (
      statusMap[estado_pedido] || {
        label: "Desconocido",
        className: "bg-gray-100 text-gray-800",
      }
    );
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

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const getFilteredOrders = (): OrderDto[] => {
    const now = new Date();
    // Obtener fecha local de "hoy" en formato YYYY-MM-DD
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    return orders.filter((order) => {
      // Convertir la fecha UTC a fecha local
      const orderDateUTC = new Date(order.fecha_creacion);
      // Obtener la fecha en zona horaria local (Perú UTC-5)
      const orderDateLocal = `${orderDateUTC.getFullYear()}-${String(orderDateUTC.getMonth() + 1).padStart(2, "0")}-${String(orderDateUTC.getDate()).padStart(2, "0")}`;

      switch (filterType) {
        case "today":
          return orderDateLocal === todayStr;

        case "1d":
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
          return orderDateLocal === yesterdayStr;

        case "2d":
          const twoDaysAgo = new Date(now);
          twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
          const twoDaysAgoStr = `${twoDaysAgo.getFullYear()}-${String(twoDaysAgo.getMonth() + 1).padStart(2, "0")}-${String(twoDaysAgo.getDate()).padStart(2, "0")}`;
          return orderDateLocal === twoDaysAgoStr;

        case "custom":
          if (!customDate) return false;
          return orderDateLocal === customDate;

        default:
          return true;
      }
    });
  };

  const filteredOrders = getFilteredOrders();

  const getFilterLabel = (): string => {
    switch (filterType) {
      case "today":
        return "Hoy";
      case "1d":
        return "Hace 1 día";
      case "2d":
        return "Hace 2 días";
      case "custom":
        if (customDate) {
          const [year, month, day] = customDate.split("-").map(Number);
          const date = new Date(year, month - 1, day);
          return date.toLocaleDateString("es-PE", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        }
        return "Fecha personalizada";
      default:
        return "";
    }
  };

  const renderOrderRow = (order: OrderDto) => {
    const uiStatus = mapBackendToUiStatus(order.estado_pedido);
    const payment = paymentBadge(order.estado_pago);

    return (
      <TableRow key={order.pedido_id}>
        <TableCell className="font-medium">{order.numero_orden}</TableCell>
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
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={statusBadge(order.estado_pedido).className}
            >
              {statusBadge(order.estado_pedido).label}
            </Badge>
            {getValidNextStatuses(order.estado_pedido).length > 0 && (
              <Select
                value=""
                onValueChange={(value) =>
                  handleStatusChange(order.pedido_id, value)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Cambiar a..." />
                </SelectTrigger>
                <SelectContent>
                  {getValidNextStatuses(order.estado_pedido).includes(
                    "pending",
                  ) && <SelectItem value="pending">Recibido</SelectItem>}
                  {getValidNextStatuses(order.estado_pedido).includes(
                    "processing",
                  ) && (
                    <SelectItem value="processing">En Preparación</SelectItem>
                  )}
                  {getValidNextStatuses(order.estado_pedido).includes(
                    "ready",
                  ) && <SelectItem value="ready">Listo</SelectItem>}
                  {getValidNextStatuses(order.estado_pedido).includes(
                    "completed",
                  ) && <SelectItem value="completed">Completado</SelectItem>}
                  {getValidNextStatuses(order.estado_pedido).includes(
                    "cancelled",
                  ) && <SelectItem value="cancelled">Cancelado</SelectItem>}
                </SelectContent>
              </Select>
            )}
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="secondary" className={payment.className}>
            {payment.label}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/admin/orders/${order.pedido_id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          <Button
            variant={filterType === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("today")}
          >
            Hoy
          </Button>
          <Button
            variant={filterType === "1d" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("1d")}
          >
            1D
          </Button>
          <Button
            variant={filterType === "2d" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("2d")}
          >
            2D
          </Button>
          <Button
            variant={filterType === "custom" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("custom")}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Personalizado
          </Button>
        </div>

        {filterType === "custom" && (
          <input
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        )}
      </div>

      {/* Tabla de pedidos */}
      {isLoading ? (
        <div className="rounded-md border">
          <div className="text-center py-8 text-muted-foreground">
            Cargando pedidos...
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-md border">
          <div className="text-center py-8 text-muted-foreground">
            {orders.length === 0
              ? "No hay pedidos registrados"
              : `No hay pedidos para ${getFilterLabel()}`}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground px-1">
            {getFilterLabel()} ({filteredOrders.length}{" "}
            {filteredOrders.length === 1 ? "pedido" : "pedidos"})
          </h2>
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
                  <TableHead className="text-right">Ver</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => renderOrderRow(order))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
