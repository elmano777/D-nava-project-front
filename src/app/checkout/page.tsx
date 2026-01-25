"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { ShoppingBag, CreditCard, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createOrderApi, type CreateOrderItemPayload } from "@/lib/api";

interface CartItem {
  id: string;
  name: string;
  price_in_cents: number;
  quantity: number;
  image_url: string;
}

const MINIMUM_ORDER_AMOUNT = 30;

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cart.length === 0) {
      router.push("/productos");
    }
    setCartItems(cart);
  }, [router]);

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(priceInCents / 100);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price_in_cents * item.quantity) / 100,
    0,
  );
  const delivery = 10.0;
  const total = subtotal + delivery;

  const isMinimumMet = subtotal >= MINIMUM_ORDER_AMOUNT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isMinimumMet) {
      alert(`El pedido mínimo es de S/ ${MINIMUM_ORDER_AMOUNT.toFixed(2)}`);
      return;
    }

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.city
    ) {
      alert("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);

    try {
      // Construir payload para el backend (CreateOrderDto)
      const items: CreateOrderItemPayload[] = cartItems.map((item) => ({
        producto_id: Number(item.id),
        cantidad: item.quantity,
      }));

      const now = new Date();
      // Por ahora programamos la entrega para dentro de 1 hora
      const fechaProgramada = new Date(
        now.getTime() + 60 * 60 * 1000,
      ).toISOString();

      const order = await createOrderApi({
        nombre_cliente: formData.name,
        telefono_cliente: formData.phone,
        email_cliente: formData.email,
        tipo_entrega: "delivery",
        direccion_entrega: formData.address,
        distrito_entrega: formData.city,
        fecha_hora_programada: fechaProgramada,
        notas_cliente: undefined,
        metodo_pago: "tarjeta",
        items,
      });

      // Guardar datos para la pantalla de pago (usado por /checkout/payment)
      localStorage.setItem("customerData", JSON.stringify(formData));
      localStorage.setItem(
        "pendingOrder",
        JSON.stringify({
          pedidoId: order.pedido_id,
          numeroOrden: order.numero_orden,
          total: order.total,
        }),
      );

      router.push("/checkout/payment");
    } catch (error: any) {
      console.error("Error creando pedido en backend:", error);
      if (error?.status === 401) {
        alert("Debes iniciar sesión para completar tu pedido.");
        router.push("/auth/login");
      } else {
        alert("Ocurrió un error al crear tu pedido. Intenta nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Finalizar Pedido
            </h1>
            <p className="text-muted-foreground">
              Completa tus datos para proceder al pago
            </p>
          </div>

          {!isMinimumMet && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                El pedido mínimo es de S/ {MINIMUM_ORDER_AMOUNT.toFixed(2)}. Te
                faltan{" "}
                {formatPrice(
                  Math.round((MINIMUM_ORDER_AMOUNT - subtotal) * 100),
                )}{" "}
                para continuar.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Datos de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nombre Completo</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Juan Pérez"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="email">Correo Electrónico</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="tu@correo.com"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="phone">Teléfono</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="999 999 999"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Input
                          id="address"
                          name="address"
                          placeholder="Av. Principal 123"
                          required
                          value={formData.address}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="city">Ciudad</Label>
                        <Input
                          id="city"
                          name="city"
                          placeholder="Lima"
                          required
                          value={formData.city}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isLoading || !isMinimumMet}
                    >
                      <CreditCard className="mr-2 h-5 w-5" />
                      {isLoading ? "Procesando..." : "Continuar al Pago"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                          <img
                            src={item.image_url || "/placeholder.svg"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="font-medium text-sm leading-tight line-clamp-2">
                            {item.name}
                          </h4>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              x{item.quantity}
                            </span>
                            <span className="font-semibold">
                              {formatPrice(item.price_in_cents * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        {formatPrice(Math.round(subtotal * 100))}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="font-medium">
                        {formatPrice(Math.round(delivery * 100))}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        {formatPrice(Math.round(total * 100))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
