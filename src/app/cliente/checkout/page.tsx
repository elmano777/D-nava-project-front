"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { ClienteNav } from "@/components/cliente/cliente-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  CreditCard,
  AlertCircle,
  Store,
  Truck,
  User,
  MapPin,
  Plus,
} from "lucide-react";
import { decodeJwt } from "@/lib/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  createOrderApi,
  type CreateOrderItemPayload,
  getAddressesApi,
  createAddressApi,
  AddressDto,
} from "@/lib/api";
import {
  useCartStore,
  MINIMUM_ORDER_AMOUNT,
  DELIVERY_COST,
  type DeliveryType,
} from "@/store/cart-store";

export default function CheckoutPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });
  const [newAddressForm, setNewAddressForm] = useState({
    alias: "",
    direccion_linea1: "",
    direccion_linea2: "",
    distrito: "",
    ciudad: "Lima",
    codigo_postal: "",
  });

  const {
    items,
    deliveryType,
    setDeliveryType,
    getSubtotal,
    getDeliveryCost,
    getTotal,
  } = useCartStore();

  // Pre-llenar datos del usuario desde el JWT
  useEffect(() => {
    const jwtData = decodeJwt();
    if (jwtData) {
      // Formatear teléfono: remover +51 y formatear solo los dígitos
      const rawPhone = (jwtData.telefono || "").replace(/^\+51/, "");
      const digits = rawPhone.replace(/[^\d]/g, "").slice(0, 9);
      const formattedPhone = digits.replace(
        /(\d{3})(\d{0,3})(\d{0,3})/,
        (_, a, b, c) => [a, b, c].filter(Boolean).join(" "),
      );

      setFormData((prev) => ({
        ...prev,
        name: jwtData.nombre_completo || "",
        email: jwtData.email || "",
        phone: formattedPhone,
      }));
    }
  }, []);

  // Cargar direcciones guardadas
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const data = await getAddressesApi();
        setAddresses(data);

        // Auto-seleccionar la dirección predeterminada
        const defaultAddress = data.find((addr) => addr.es_predeterminada);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.direccion_id);
          setFormData((prev) => ({
            ...prev,
            address: defaultAddress.direccion_linea1,
            city: defaultAddress.distrito,
          }));
        }
      } catch (error) {
        console.error("Error cargando direcciones:", error);
      }
    };

    loadAddresses();
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cliente");
    }
  }, [items, router]);

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(priceInCents / 100);
  };

  const subtotal = getSubtotal();
  const deliveryCost = getDeliveryCost();
  const total = getTotal();
  const isMinimumMet = subtotal >= MINIMUM_ORDER_AMOUNT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isMinimumMet) {
      alert(`El pedido mínimo es de S/ ${MINIMUM_ORDER_AMOUNT.toFixed(2)}`);
      return;
    }

    if (!formData.name || !formData.email || !formData.phone) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    // Validar que el teléfono tenga 9 dígitos
    const phoneDigits = formData.phone.replace(/\s/g, "");
    if (phoneDigits.length !== 9) {
      alert("El teléfono debe tener 9 dígitos");
      return;
    }

    if (deliveryType === "delivery" && (!formData.address || !formData.city)) {
      alert("Por favor completa la dirección de entrega");
      return;
    }

    setIsLoading(true);

    try {
      const orderItems: CreateOrderItemPayload[] = items.map((item) => ({
        producto_id: Number(item.id),
        cantidad: item.quantity,
      }));

      const now = new Date();
      const fechaProgramada = new Date(
        now.getTime() + 60 * 60 * 1000,
      ).toISOString();

      const order = await createOrderApi({
        nombre_cliente: formData.name,
        telefono_cliente: `+51${formData.phone.replace(/\s/g, "")}`,
        email_cliente: formData.email,
        tipo_entrega: deliveryType,
        direccion_entrega:
          deliveryType === "delivery" ? formData.address : undefined,
        distrito_entrega:
          deliveryType === "delivery" ? formData.city : undefined,
        fecha_hora_programada: fechaProgramada,
        notas_cliente: undefined,
        metodo_pago: "tarjeta", // se actualiza después del pago real en /payment
        items: orderItems,
      });

      localStorage.setItem("customerData", JSON.stringify(formData));
      localStorage.setItem(
        "pendingOrder",
        JSON.stringify({
          pedidoId: order.pedido_id,
          numeroOrden: order.numero_orden,
          total: order.total,
        }),
      );

      router.push("/cliente/checkout/payment");
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Extraer solo dígitos
    const raw = e.target.value.replace(/[^\d]/g, "");

    // Formatear automáticamente: 928 750 445 (grupos de 3-3-3)
    const formatted = raw
      .slice(0, 9)
      .replace(/(\d{3})(\d{0,3})(\d{0,3})/, (_, a, b, c) =>
        [a, b, c].filter(Boolean).join(" "),
      );

    setFormData((prev) => ({ ...prev, phone: formatted }));
  };

  const handleSelectAddress = (addressId: number) => {
    const address = addresses.find((addr) => addr.direccion_id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      setFormData((prev) => ({
        ...prev,
        address: address.direccion_linea1,
        city: address.distrito,
      }));
    }
  };

  const handleCreateNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newAddress = await createAddressApi(newAddressForm);
      setAddresses((prev) => [...prev, newAddress]);
      setSelectedAddressId(newAddress.direccion_id);
      setFormData((prev) => ({
        ...prev,
        address: newAddress.direccion_linea1,
        city: newAddress.distrito,
      }));
      setIsDialogOpen(false);

      // Reset form
      setNewAddressForm({
        alias: "",
        direccion_linea1: "",
        direccion_linea2: "",
        distrito: "",
        ciudad: "Lima",
        codigo_postal: "",
      });
    } catch (error) {
      console.error("Error creando dirección:", error);
      alert("No se pudo crear la dirección. Intenta nuevamente.");
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <ClienteNav />
      <main className="container mx-auto px-4 py-8">
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
              {/* Tipo de recojo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Tipo de Recojo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={deliveryType}
                    onValueChange={(value) =>
                      setDeliveryType(value as DeliveryType)
                    }
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem
                        value="recojo_tienda"
                        id="recojo_tienda"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="recojo_tienda"
                        className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <Store className="mb-2 h-6 w-6" />
                        <span className="font-semibold">Recojo en tienda</span>
                        <span className="text-sm text-muted-foreground">
                          Gratis
                        </span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="delivery"
                        id="delivery"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="delivery"
                        className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <Truck className="mb-2 h-6 w-6" />
                        <span className="font-semibold">Delivery</span>
                        <span className="text-sm text-muted-foreground">
                          S/ {DELIVERY_COST.toFixed(2)}
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Datos del cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    {deliveryType === "delivery"
                      ? "Datos de Entrega"
                      : "Datos de Contacto"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nombre Completo *</Label>
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
                          <Label htmlFor="email">Correo Electrónico *</Label>
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
                          <Label htmlFor="phone">Teléfono *</Label>
                          <div className="flex gap-2">
                            <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground select-none">
                              +51
                            </div>
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              placeholder="928 750 445"
                              maxLength={11}
                              required
                              value={formData.phone}
                              onChange={handlePhoneChange}
                            />
                          </div>
                        </div>
                      </div>

                      {deliveryType === "delivery" && (
                        <>
                          <div className="grid gap-3">
                            <Label>Dirección de Entrega *</Label>

                            {addresses.length > 0 && (
                              <RadioGroup
                                value={
                                  selectedAddressId
                                    ? String(selectedAddressId)
                                    : ""
                                }
                                onValueChange={(value) =>
                                  handleSelectAddress(Number(value))
                                }
                                className="space-y-2"
                              >
                                {addresses.map((address) => (
                                  <div
                                    key={address.direccion_id}
                                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                                      selectedAddressId === address.direccion_id
                                        ? "border-primary bg-primary/5"
                                        : "hover:border-muted-foreground/50"
                                    }`}
                                    onClick={() =>
                                      handleSelectAddress(address.direccion_id)
                                    }
                                  >
                                    <div className="flex items-start gap-2">
                                      <RadioGroupItem
                                        value={String(address.direccion_id)}
                                        id={`addr-${address.direccion_id}`}
                                        className="mt-0.5"
                                      />
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <MapPin className="h-4 w-4 text-primary" />
                                          <span className="font-medium">
                                            {address.alias}
                                          </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {address.direccion_linea1}
                                          {address.direccion_linea2 &&
                                            `, ${address.direccion_linea2}`}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {address.distrito}, {address.ciudad}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </RadioGroup>
                            )}

                            <Dialog
                              open={isDialogOpen}
                              onOpenChange={setIsDialogOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full"
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Agregar Nueva Dirección
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Nueva Dirección</DialogTitle>
                                </DialogHeader>
                                <form
                                  onSubmit={handleCreateNewAddress}
                                  className="space-y-4"
                                >
                                  <div>
                                    <Label htmlFor="new-alias">
                                      Nombre / Alias *
                                    </Label>
                                    <Input
                                      id="new-alias"
                                      placeholder="Casa, Trabajo, Universidad..."
                                      value={newAddressForm.alias}
                                      onChange={(e) =>
                                        setNewAddressForm({
                                          ...newAddressForm,
                                          alias: e.target.value,
                                        })
                                      }
                                      required
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor="new-direccion">
                                      Dirección (Calle y Número) *
                                    </Label>
                                    <Input
                                      id="new-direccion"
                                      placeholder="Av. Javier Prado 123"
                                      value={newAddressForm.direccion_linea1}
                                      onChange={(e) =>
                                        setNewAddressForm({
                                          ...newAddressForm,
                                          direccion_linea1: e.target.value,
                                        })
                                      }
                                      required
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor="new-referencia">
                                      Referencia / Dpto (Opcional)
                                    </Label>
                                    <Input
                                      id="new-referencia"
                                      placeholder="Dpto 301, Edificio B..."
                                      value={newAddressForm.direccion_linea2}
                                      onChange={(e) =>
                                        setNewAddressForm({
                                          ...newAddressForm,
                                          direccion_linea2: e.target.value,
                                        })
                                      }
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="new-distrito">
                                        Distrito *
                                      </Label>
                                      <Input
                                        id="new-distrito"
                                        placeholder="San Isidro"
                                        value={newAddressForm.distrito}
                                        onChange={(e) =>
                                          setNewAddressForm({
                                            ...newAddressForm,
                                            distrito: e.target.value,
                                          })
                                        }
                                        required
                                      />
                                    </div>

                                    <div>
                                      <Label htmlFor="new-codigo">
                                        Código Postal *
                                      </Label>
                                      <Input
                                        id="new-codigo"
                                        placeholder="15073"
                                        value={newAddressForm.codigo_postal}
                                        onChange={(e) =>
                                          setNewAddressForm({
                                            ...newAddressForm,
                                            codigo_postal: e.target.value,
                                          })
                                        }
                                        required
                                      />
                                    </div>
                                  </div>

                                  <div className="flex justify-end gap-2 pt-4">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => setIsDialogOpen(false)}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button type="submit">Crear</Button>
                                  </div>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </>
                      )}
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

            {/* Resumen del pedido */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map((item) => (
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
                    {deliveryType === "delivery" && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery</span>
                        <span className="font-medium">
                          {formatPrice(Math.round(deliveryCost * 100))}
                        </span>
                      </div>
                    )}
                    {deliveryType === "recojo_tienda" && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Recojo en tienda
                        </span>
                        <span className="font-medium text-green-600">
                          Gratis
                        </span>
                      </div>
                    )}
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
    </div>
  );
}
