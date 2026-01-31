"use client";

import type React from "react";
import { useState } from "react";
import { ClienteNav } from "@/components/cliente/cliente-nav";
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
import { getMyOrderByNumberApi, ApiError } from "@/lib/api";

export default function ConsultarPedidoClientePage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const trimmed = orderNumber.trim();
    if (!trimmed) {
      setError("Ingresa un número de orden.");
      setIsLoading(false);
      return;
    }

    try {
      const order = await getMyOrderByNumberApi(trimmed);
      router.push(`/cliente/pedido/${order.pedido_id}`);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 403) {
        setError(
          "Este pedido no te pertenece. Solo puedes consultar tus propios pedidos.",
        );
      } else {
        setError(
          "Pedido no encontrado. Verifica el número de orden e intenta nuevamente.",
        );
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ClienteNav />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Consultar Estado de Pedido
            </h1>
            <p className="text-muted-foreground">
              Ingresa tu número de orden para ver su estado
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Buscar Pedido</CardTitle>
              <CardDescription>
                Ingresa el número de orden que recibiste en tu correo de
                confirmación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Número de Orden</Label>
                  <Input
                    id="orderNumber"
                    type="text"
                    placeholder="Ej: ORD-1769800795019-673"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
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
