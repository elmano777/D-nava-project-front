"use client";

import { useState, useEffect, useCallback } from "react";
import { ClienteNav } from "@/components/cliente/cliente-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createPaymentPreferenceApi } from "@/lib/api";

export default function PaymentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initPoint, setInitPoint] = useState<string | null>(null);

  const fetchPreference = useCallback(async () => {
    try {
      const pendingOrderStr = localStorage.getItem("pendingOrder");

      if (!pendingOrderStr) {
        router.push("/cliente");
        return null;
      }

      const pendingOrder = JSON.parse(pendingOrderStr) as {
        pedidoId?: number;
        numeroOrden?: string;
        orderId?: string | number;
        orderNumber?: string;
      };

      const rawId =
        typeof pendingOrder.pedidoId === "number" &&
        !Number.isNaN(pendingOrder.pedidoId)
          ? pendingOrder.pedidoId
          : pendingOrder.orderId;

      const pedidoId = Number(rawId);
      if (!pedidoId || Number.isNaN(pedidoId)) {
        throw new Error("ID de pedido inválido para Mercado Pago");
      }

      const result = await createPaymentPreferenceApi(pedidoId);

      setInitPoint(result.initPoint || result.sandboxInitPoint || null);

      return result.initPoint;
    } catch (error) {
      console.error("Error creando preferencia de Mercado Pago:", error);
      setError(
        "Error al iniciar el pago con Mercado Pago. Por favor intenta nuevamente."
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchPreference().catch(() => {});
  }, [fetchPreference]);

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <ClienteNav />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Error</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-red-500">{error}</p>
                <Button onClick={() => router.push("/cliente/checkout")}>
                  Volver al checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ClienteNav />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Pago Seguro</h1>
            <p className="text-muted-foreground">
              Serás redirigido a Mercado Pago para completar tu pago.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pago</CardTitle>
            </CardHeader>
            <CardContent className="min-h-[200px] flex flex-col items-center justify-center gap-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">
                    Creando preferencia de pago en Mercado Pago...
                  </p>
                </div>
              ) : initPoint ? (
                <Button
                  size="lg"
                  className="w-full max-w-sm"
                  onClick={() => {
                    window.location.href = initPoint;
                  }}
                >
                  Ir a pagar con Mercado Pago
                </Button>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-red-500">
                    No se pudo inicializar el pago. Por favor vuelve al checkout
                    e inténtalo nuevamente.
                  </p>
                  <Button onClick={() => router.push("/cliente/checkout")}>
                    Volver al checkout
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
