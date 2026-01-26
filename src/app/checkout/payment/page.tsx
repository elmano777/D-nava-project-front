"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard, CheckCircle } from "lucide-react";

// Extend Window interface for Culqi
declare global {
  interface Window {
    Culqi?: {
      publicKey: string;
      settings: (config: CulqiSettings) => void;
      options: (config: CulqiOptions) => void;
      open: () => void;
      close: () => void;
      token?: CulqiToken;
      order?: CulqiOrder;
      error?: CulqiError;
    };
    culqi?: () => void;
  }
}

interface CulqiSettings {
  title: string;
  currency: string;
  amount: number;
  order?: string;
  xculqirsaid?: string;
  rsapublickey?: string;
}

interface CulqiOptions {
  lang?: string;
  installments?: boolean;
  paymentMethods?: {
    tarjeta?: boolean;
    yape?: boolean;
    bancaMovil?: boolean;
    agente?: boolean;
    billetera?: boolean;
    cuotealo?: boolean;
  };
  style?: {
    logo?: string;
    bannerColor?: string;
    buttonBackground?: string;
    menuColor?: string;
    linksColor?: string;
    buttonText?: string;
    buttonTextColor?: string;
    priceColor?: string;
  };
}

interface CulqiToken {
  id: string;
  type: string;
  email: string;
  card_number: string;
  last_four: string;
  active: boolean;
  iin: {
    bin: string;
    card_brand: string;
    card_type: string;
    card_category: string;
    issuer: {
      name: string;
      country: string;
      country_code: string;
      website: string;
      phone_number: string;
    };
  };
}

interface CulqiOrder {
  id: string;
}

interface CulqiError {
  merchant_message: string;
  user_message: string;
  type: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<{
    pedidoId: number;
    total: number;
    numeroOrden: string;
  } | null>(null);
  const [culqiReady, setCulqiReady] = useState(false);
  const [tokenGenerated, setTokenGenerated] = useState<CulqiToken | null>(null);
  const culqiScriptLoaded = useRef(false);

  // Load order data from localStorage
  const fetchOrderData = useCallback(async () => {
    try {
      const pendingOrderStr = localStorage.getItem("pendingOrder");

      if (!pendingOrderStr) {
        router.push("/productos");
        return null;
      }

      const pendingOrder = JSON.parse(pendingOrderStr) as {
        pedidoId?: number;
        numeroOrden?: string;
        total?: number;
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
        throw new Error("ID de pedido inválido");
      }

      // For public checkout, we need the total from localStorage since we can't call authenticated API
      const total = pendingOrder.total || 0;
      const numeroOrden =
        pendingOrder.numeroOrden || pendingOrder.orderNumber || "";

      if (!total) {
        throw new Error("Total del pedido no disponible");
      }

      setOrderData({
        pedidoId,
        total,
        numeroOrden,
      });

      return { pedidoId, total, numeroOrden };
    } catch (err) {
      console.error("Error obteniendo datos del pedido:", err);
      setError(
        "Error al obtener los datos del pedido. Por favor intenta nuevamente.",
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Load Culqi script
  useEffect(() => {
    if (culqiScriptLoaded.current) return;

    const script = document.createElement("script");
    script.src = "https://checkout.culqi.com/js/v4";
    script.async = true;
    script.onload = () => {
      culqiScriptLoaded.current = true;
      if (window.Culqi) {
        window.Culqi.publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || "";
        setCulqiReady(true);
      }
    };
    script.onerror = () => {
      setError(
        "Error al cargar el sistema de pagos. Por favor recarga la página.",
      );
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Setup Culqi callback
  useEffect(() => {
    window.culqi = () => {
      if (window.Culqi?.token) {
        const token = window.Culqi.token;
        console.log("Token Culqi generado:", token);
        setTokenGenerated(token);

        // TODO: Cuando el backend esté listo, enviar el token aquí
      } else if (window.Culqi?.order) {
        console.log("Order Culqi:", window.Culqi.order);
      } else if (window.Culqi?.error) {
        console.error("Error Culqi:", window.Culqi.error);
        setError(
          window.Culqi.error.user_message || "Error al procesar el pago",
        );
      }
    };

    return () => {
      window.culqi = undefined;
    };
  }, []);

  // Fetch order data on mount
  useEffect(() => {
    fetchOrderData();
  }, [fetchOrderData]);

  const handleOpenCulqi = () => {
    if (!window.Culqi || !orderData) return;

    // Process RSA key - replace literal \n with actual newlines
    const rsaPublicKey = (
      process.env.NEXT_PUBLIC_CULQI_RSA_PUBLIC_KEY || ""
    ).replace(/\\n/g, "\n");

    // Configure Culqi settings
    window.Culqi.settings({
      title: "Pana",
      currency: "PEN",
      amount: Math.round(orderData.total * 100), // Culqi expects amount in cents
      xculqirsaid: process.env.NEXT_PUBLIC_CULQI_RSA_ID,
      rsapublickey: rsaPublicKey,
    });

    // Configure Culqi options
    window.Culqi.options({
      lang: "es",
      installments: false,
      paymentMethods: {
        tarjeta: true,
        yape: true,
        bancaMovil: false,
        agente: false,
        billetera: false,
        cuotealo: false,
      },
      style: {
        bannerColor: "#000000",
        buttonBackground: "#000000",
        buttonText: "Pagar",
        buttonTextColor: "#FFFFFF",
      },
    });

    // Open Culqi checkout
    window.Culqi.open();
  };

  if (error && !tokenGenerated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Error</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-red-500">{error}</p>
                <Button onClick={() => router.push("/checkout")}>
                  Volver al checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show success state when token is generated
  if (tokenGenerated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  Token Generado Exitosamente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium mb-2">
                    El checkout de Culqi funciona correctamente.
                  </p>
                  <p className="text-sm text-green-700">
                    Token ID:{" "}
                    <code className="bg-green-100 px-1 rounded">
                      {tokenGenerated.id}
                    </code>
                  </p>
                  <p className="text-sm text-green-700">
                    Tarjeta: {tokenGenerated.iin?.card_brand} ****{" "}
                    {tokenGenerated.last_four}
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Nota:</strong> El backend aún no está configurado
                    para procesar pagos con Culqi. Cuando esté listo, este token
                    se enviará automáticamente para completar el cargo.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => router.push("/")}>
                    Volver al inicio
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setTokenGenerated(null)}
                  >
                    Probar de nuevo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Pago Seguro</h1>
            <p className="text-muted-foreground">
              Completa tu pago de forma segura con Culqi.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pago</CardTitle>
            </CardHeader>
            <CardContent className="min-h-[200px] flex flex-col items-center justify-center gap-4">
              {isLoading || !culqiReady ? (
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">
                    Preparando opciones de pago...
                  </p>
                </div>
              ) : orderData ? (
                <div className="w-full max-w-sm space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground">
                      Total a pagar
                    </p>
                    <p className="text-3xl font-bold">
                      S/ {orderData.total.toFixed(2)}
                    </p>
                    {orderData.numeroOrden && (
                      <p className="text-xs text-muted-foreground">
                        Orden: {orderData.numeroOrden}
                      </p>
                    )}
                  </div>

                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleOpenCulqi}
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pagar con Culqi
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Aceptamos tarjetas de crédito, débito y Yape
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-red-500">
                    No se pudo obtener la información del pedido.
                  </p>
                  <Button onClick={() => router.push("/checkout")}>
                    Volver al checkout
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
