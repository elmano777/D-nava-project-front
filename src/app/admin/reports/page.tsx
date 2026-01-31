"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  Package,
  ShoppingCart,
  Calendar,
} from "lucide-react";
import { getStoredUser } from "@/lib/auth";
import {
  getSalesStatsApi,
  listOrdersApi,
  getSalesReportApi,
  getTopProductsApi,
  SalesStatsResponse,
  SalesReportResponse,
  OrderDto,
} from "@/lib/api";

interface TopProduct {
  producto_id: number;
  nombre_producto: string;
  cantidad_vendida: number;
  total_ingresos: string;
  cantidad_pedidos: number;
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<SalesStatsResponse | null>(null);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [salesReport, setSalesReport] = useState<SalesReportResponse | null>(
    null,
  );

  // Filtros para reporte de ventas
  const [period, setPeriod] = useState<string>("month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  useEffect(() => {
    const user = getStoredUser();

    if (!user || user.rol !== "administrador") {
      router.push("/auth/login");
      return;
    }

    const loadData = async () => {
      try {
        const [statsData, ordersData, topProductsData] = await Promise.all([
          getSalesStatsApi().catch(() => null),
          listOrdersApi().catch(() => []),
          getTopProductsApi(10).catch(() => []),
        ]);

        if (statsData) setStats(statsData);
        setOrders(ordersData);
        setTopProducts(topProductsData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  // Cargar reporte de ventas con filtros
  useEffect(() => {
    const loadSalesReport = async () => {
      try {
        const params: { period: string; startDate?: string; endDate?: string } =
          { period };

        if (period === "custom") {
          if (customStartDate && customEndDate) {
            params.startDate = customStartDate;
            params.endDate = customEndDate;
          } else {
            return;
          }
        }

        const report = await getSalesReportApi(params);
        setSalesReport(report);
      } catch (error) {
        console.error("Error cargando reporte de ventas:", error);
      }
    };

    loadSalesReport();
  }, [period, customStartDate, customEndDate]);

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

        {/* Filtro de Período */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Reporte por Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Hoy</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mes</SelectItem>
                  <SelectItem value="year">Último año</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>

              {period === "custom" && (
                <>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    placeholder="Fecha inicio"
                    className="w-full sm:w-auto"
                  />
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    placeholder="Fecha fin"
                    className="w-full sm:w-auto"
                  />
                </>
              )}
            </div>

            {salesReport && (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Período: {salesReport.periodo}
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">
                      Ingresos del Período
                    </p>
                    <p className="text-2xl font-bold">
                      {formatPrice(salesReport.total_ventas)}
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">
                      Pedidos
                    </p>
                    <p className="text-2xl font-bold">
                      {salesReport.total_pedidos}
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">
                      Venta Promedio
                    </p>
                    <p className="text-2xl font-bold">
                      {formatPrice(salesReport.promedio_venta)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

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

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
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

          <Card>
            <CardHeader>
              <CardTitle>Top 5 Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProducts.slice(0, 5).map((product, index) => (
                  <div
                    key={product.producto_id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm truncate max-w-[150px]">
                        {product.nombre_producto}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {product.cantidad_vendida} unidades
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(Number(product.total_ingresos))}
                      </p>
                    </div>
                  </div>
                ))}
                {topProducts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay datos disponibles
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista completa de Top Productos */}
        {topProducts.length > 5 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Top 10 Productos Más Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topProducts.map((product, index) => (
                  <div
                    key={product.producto_id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{product.nombre_producto}</p>
                        <p className="text-sm text-muted-foreground">
                          Producto ID: {product.producto_id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {product.cantidad_vendida} unidades vendidas
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ingresos: {formatPrice(Number(product.total_ingresos))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
