"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ClienteNav } from "@/components/cliente/cliente-nav";
import {
  getOrderApi,
  createCulqiChargeApi,
  createCulqiOrderApi,
} from "@/lib/api";
import { Loader2, CreditCard } from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();
  const culqiRef = useRef<any>(null);

  const [culqiReady, setCulqiReady] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [culqiOrderId, setCulqiOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [preparingPayment, setPreparingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- LOAD CULQI SCRIPT ---------------- */
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.culqi.com/checkout-js";
    script.async = true;
    script.onload = () => setCulqiReady(true);
    document.body.appendChild(script);
  }, []);

  /* ---------------- LOAD ORDER ---------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const pending = localStorage.getItem("pendingOrder");
        if (!pending) return router.push("/cliente");

        const { pedidoId } = JSON.parse(pending);
        const order = await getOrderApi(pedidoId);

        const user = JSON.parse(localStorage.getItem("backend_user") || "{}");

        setOrderData({
          pedidoId,
          total: Number(order.total),
          numeroOrden: order.numero_orden,
          email: user.email || "",
        });
      } catch (e) {
        setError("Error cargando pedido");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  /* ---------------- PAYMENT HANDLER ---------------- */
  const processPayment = useCallback(
    async (sourceId: string, email: string) => {
      try {
        const res = await createCulqiChargeApi({
          pedido_id: orderData.pedidoId,
          source_id: sourceId,
          email,
        });

        if (res.outcome_type === "venta_exitosa") {
          localStorage.removeItem("pendingOrder");
          router.push(`/cliente/pedido/${orderData.pedidoId}`);
        } else {
          setError(res.user_message || "Pago rechazado");
        }
      } catch (err: any) {
        setError(err.message || "Error de pago");
      }
    },
    [orderData, router],
  );

  /* ---------------- OPEN CULQI ---------------- */
  const openCulqi = async () => {
    if (!culqiReady || !orderData) return;

    setError(null);
    setPreparingPayment(true);

    // Crear order de Culqi para habilitar Yape
    let orderId = culqiOrderId;
    if (!orderId) {
      try {
        const culqiOrder = await createCulqiOrderApi(orderData.pedidoId);
        orderId = culqiOrder.order_id;
        setCulqiOrderId(orderId);
      } catch (err: any) {
        console.warn(
          "No se pudo crear order de Culqi, Yape no disponible:",
          err,
        );
        // Continuar sin order (solo tarjetas)
      }
    }

    setPreparingPayment(false);

    const settings: any = {
      title: "Pana",
      currency: "PEN",
      amount: Math.round(orderData.total * 100),
    };

    // Agregar order si existe (habilita Yape)
    if (orderId) {
      settings.order = orderId;
    }

    const client = {
      email: orderData.email,
    };

    const paymentMethods = {
      tarjeta: true,
      yape: !!orderId, // Solo habilitar Yape si tenemos order
      billetera: false,
      bancaMovil: false,
      agente: false,
      cuotealo: false,
    };

    const options = {
      lang: "es",
      modal: true,
      installments: false,
      paymentMethods,
      paymentMethodsSort: Object.keys(paymentMethods),
    };

    const appearance = {
      theme: "default",
      menuType: "sidebar",
      buttonCardPayText: "Pagar",
      defaultStyle: {
        bannerColor: "#000000",
        buttonBackground: "#000000",
        buttonTextColor: "#FFFFFF",
      },
    };

    const config = {
      settings,
      client,
      options,
      appearance,
    };

    const publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY;

    culqiRef.current = new (window as any).CulqiCheckout(publicKey, config);

    culqiRef.current.culqi = () => {
      if (culqiRef.current.token) {
        const token = culqiRef.current.token;
        culqiRef.current.close();
        processPayment(token.id, token.email || orderData.email);
      } else if (culqiRef.current.order) {
        // Yape / billeteras - el pago ya fue procesado por Culqi
        culqiRef.current.close();
        localStorage.removeItem("pendingOrder");
        router.push(`/cliente/pedido/${orderData.pedidoId}`);
      } else {
        setError(culqiRef.current.error?.user_message || "Error en Culqi");
      }
    };

    culqiRef.current.open();
  };

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <ClienteNav />
        <div className="max-w-md mx-auto mt-20 text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <Button
            variant="outline"
            onClick={() => {
              setError(null);
              setCulqiOrderId(null);
            }}
          >
            Intentar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ClienteNav />
      <div className="max-w-md mx-auto mt-20 text-center space-y-4">
        <p className="text-sm text-muted-foreground">Total a pagar</p>
        <p className="text-3xl font-bold">S/ {orderData.total.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground">
          Orden: {orderData.numeroOrden}
        </p>

        <Button
          size="lg"
          className="w-full"
          onClick={openCulqi}
          disabled={preparingPayment || !culqiReady}
        >
          {preparingPayment ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Preparando...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-5 w-5" />
              Pagar con Culqi
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground">Tarjeta, Yape</p>
      </div>
    </div>
  );
}

/*
 * ==================== CODIGO ANTERIOR (SIN YAPE ORDER) ====================
 * Si necesitas volver al código anterior que no creaba order de Culqi:
 *
 * 1. Quitar import de createCulqiOrderApi
 * 2. Quitar estado culqiOrderId y preparingPayment
 * 3. Cambiar openCulqi a función síncrona (no async)
 * 4. Quitar la lógica de crear order antes de abrir
 * 5. Poner yape: true directamente (aunque no funcionará sin order)
 *
 * El código anterior básicamente era:
 *   const openCulqi = () => {
 *     const settings = { title, currency, amount }; // sin order
 *     const paymentMethods = { tarjeta: true, yape: true, ... };
 *     // ... resto igual
 *   };
 * ===========================================================================
 */
