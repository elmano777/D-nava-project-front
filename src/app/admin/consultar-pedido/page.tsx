"use client";

import type React from "react";
import { useState } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { getOrderApi } from "@/lib/api";

export default function ConsultarPedidoAdminPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const id = parseInt(orderId.trim(), 10);
    if (isNaN(id)) {
      setError("Ingresa un ID de pedido válido.");
      setIsLoading(false);
      return;
    }

    try {
      const order = await getOrderApi(id);

      if (!order) {
        setError("Pedido no encontrado. Verifica el ID e intenta nuevamente.");
        setIsLoading(false);
        return;
      }

      router.push(`/admin/orders/${order.pedido_id}`);
    } catch (error) {
      setError("Pedido no encontrado. Verifica el ID e intenta nuevamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Buscar Pedido por ID
            </h1>
            <p className="text-muted-foreground">
              Busca un pedido específico por su ID
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Buscar Pedido</CardTitle>
              <CardDescription>
                Ingresa el ID del pedido para ver sus detalles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orderId">ID del Pedido</Label>
                  <Input
                    id="orderId"
                    type="number"
                    placeholder="Ej: 23"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    required
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  <Search className="mr-2 h-4 w-4" />
                  {isLoading ? "Buscando..." : "Buscar Pedido"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
