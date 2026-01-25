"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Package, ShoppingCart } from "lucide-react";
import { getStoredUser } from "@/lib/auth";
import {
  getSalesStatsApi,
  listOrdersApi,
  SalesStatsResponse,
  OrderDto,
} from "@/lib/api";

export default function AdminReportsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<SalesStatsResponse | null>(null);
  const [orders, setOrders] = useState<OrderDto[]>([]);

  useEffect(() => {
    const user = getStoredUser();

    if (!user || user.rol !== "administrador") {
      router.push("/auth/login");
      return;
    }

    const loadData = async () => {
      try {
        const [statsData, ordersData] = await Promise.all([
          getSalesStatsApi().catch(() => null),
          listOrdersApi().catch(() => []),
        ]);

        if (statsData) setStats(statsData);
        setOrders(ordersData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount);
  };

  // Contar pedidos por estado
  const pendingOrders = orders.filter(
    (o) => o.estado_pedido === "recibido",
  ).length;
  const processingOrders = orders.filter(
    (o) => o.estado_pedido === "en_preparacion",
  ).length;
  const completedOrders = orders.filter(
    (o) => o.estado_pedido === "completado",
  ).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Reportes de Ventas</h1>
          <p className="text-muted-foreground">
            Analiza el rendimiento de tu negocio
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ingresos Totales
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(stats?.total_ingresos || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pedidos
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.total_pedidos || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ticket Promedio
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(stats?.ticket_promedio || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.pedidos_completados || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Rendimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Tasa de Conversión
                  </span>
                  <span className="font-bold">
                    {((stats?.tasa_conversion || 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Pedidos Cancelados
                  </span>
                  <span className="font-bold">
                    {stats?.pedidos_cancelados || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Ingresos por Pedido
                  </span>
                  <span className="font-bold">
                    {formatPrice(stats?.ticket_promedio || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estado de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Recibidos (Pendientes)</span>
                  <span className="font-bold">{pendingOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">En Preparación</span>
                  <span className="font-bold">{processingOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completados</span>
                  <span className="font-bold">{completedOrders}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
