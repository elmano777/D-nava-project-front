"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { getStoredUser } from "@/lib/auth";
import {
  getSalesStatsApi,
  listProductsApi,
  listOrdersApi,
  SalesStatsResponse,
} from "@/lib/api";

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<SalesStatsResponse | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    const user = getStoredUser();

    // Verificar autenticación y rol
    if (!user || user.rol !== "administrador") {
      router.push("/auth/login");
      return;
    }

    // Cargar estadísticas
    const loadStats = async () => {
      try {
        const [statsData, products, orders] = await Promise.all([
          getSalesStatsApi().catch(() => null),
          listProductsApi({ active: true }).catch(() => []),
          listOrdersApi().catch(() => []),
        ]);

        if (statsData) {
          setStats(statsData);
        }

        setTotalProducts(products.length);

        // Contar pedidos pendientes (recibido o en_preparacion)
        const pending = orders.filter(
          (o) =>
            o.estado_pedido === "recibido" ||
            o.estado_pedido === "en_preparacion",
        ).length;
        setPendingOrders(pending);
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [router]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount);
  };

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
          <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
          <p className="text-muted-foreground">
            Bienvenido al panel de control de D`Nava
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Productos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
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
                Ingresos Totales
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(parseFloat(stats?.ingresos_totales || "0"))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pedidos Pendientes
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Accesos Rápidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a
                href="/admin/products"
                className="block p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <h3 className="font-semibold mb-1">Gestionar Productos</h3>
                <p className="text-sm text-muted-foreground">
                  Añadir, editar o eliminar productos
                </p>
              </a>
              <a
                href="/admin/orders"
                className="block p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <h3 className="font-semibold mb-1">Gestionar Pedidos</h3>
                <p className="text-sm text-muted-foreground">
                  Ver y actualizar estado de pedidos
                </p>
              </a>
              <a
                href="/admin/reports"
                className="block p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <h3 className="font-semibold mb-1">Reportes de Ventas</h3>
                <p className="text-sm text-muted-foreground">
                  Consultar estadísticas y reportes
                </p>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Pedidos Completados
                </span>
                <span className="font-semibold">
                  {stats?.pedidos_completados || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Pedidos Cancelados
                </span>
                <span className="font-semibold">
                  {stats?.pedidos_cancelados || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Ticket Promedio
                </span>
                <span className="font-semibold">
                  {formatPrice(parseFloat(stats?.ticket_promedio || "0"))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Tasa de Conversión
                </span>
                <span className="font-semibold">
                  {((stats?.tasa_conversion || 0) * 100).toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
