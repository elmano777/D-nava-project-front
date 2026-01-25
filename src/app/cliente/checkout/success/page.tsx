"use client";

import { useEffect, useState } from "react";
import { ClienteNav } from "@/components/cliente/cliente-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";

export default function SuccessPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    const pendingOrderStr = localStorage.getItem("pendingOrder");

    if (pendingOrderStr) {
      const pendingOrder = JSON.parse(pendingOrderStr);
      setOrderNumber(pendingOrder.numeroOrden || pendingOrder.orderNumber);
      setOrderId(pendingOrder.pedidoId || pendingOrder.orderId);

      // Clear cart and order data
      clearCart();
      localStorage.removeItem("customerData");
      localStorage.removeItem("pendingOrder");
    } else {
      router.push("/cliente");
    }
  }, [router, clearCart]);

  return (
    <div className="min-h-screen bg-background">
      <ClienteNav />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-3xl mb-2">¡Pago Exitoso!</CardTitle>
                <p className="text-muted-foreground">
                  Tu pedido ha sido confirmado
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 p-6 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>Número de Pedido</span>
                </div>
                <p className="text-2xl font-bold">{orderNumber}</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Te hemos enviado un correo electrónico con los detalles de tu
                  pedido. Puedes consultar el estado de tu pedido en cualquier
                  momento.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1">
                  <Link href={`/cliente/pedido/${orderId}`}>
                    Ver Estado del Pedido
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 bg-transparent"
                >
                  <Link href="/cliente">Seguir Comprando</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
