"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
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
import {
  AddressMapPicker,
  type AddressComponents,
} from "@/components/maps/address-map-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateDeliveryDistanceByCoords } from "@/lib/distance-calculator";

export default function CheckoutPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [distanceError, setDistanceError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [isNewAddressDialogOpen, setIsNewAddressDialogOpen] = useState(false);
  const [isQuickAddressDialogOpen, setIsQuickAddressDialogOpen] =
    useState(false);
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
  const [tempCoordinates, setTempCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  // Dirección seleccionada desde el mapa (para mostrar en la UI)
  const [quickSelectedAddress, setQuickSelectedAddress] = useState<{
    direccion: string;
    distrito: string;
    ciudad: string;
  } | null>(null);

  const {
    items,
    deliveryType,
    setDeliveryType,
    setDeliveryCost,
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

  // Función para seleccionar dirección y calcular delivery
  const handleSelectAddress = async (addressId: number) => {
    const address = addresses.find((addr) => addr.direccion_id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      setFormData((prev) => ({
        ...prev,
        address: address.direccion_linea1,
        city: address.distrito,
      }));

      // Calcular distancia usando la dirección completa
      // Formato mejorado para geocodificación
      const fullAddress = `${address.direccion_linea1}, ${address.distrito}, Lima, Perú`;

      setIsCalculatingDistance(true);
      setDistanceError(null);

      try {
        const { calculateDeliveryDistance } =
          await import("@/lib/distance-calculator");
        const result = await calculateDeliveryDistance(fullAddress);

        if (!result.isWithinCoverage) {
          setDistanceError(
            `Lo sentimos, no realizamos entregas a más de 8 km. Esta dirección está a ${result.distanceInKm.toFixed(1)} km.`,
          );
          setDeliveryCost(0);
        } else {
          setDeliveryCost(result.deliveryCost);
        }
      } catch (error: any) {
        // Si no se puede geocodificar (Geocoding API no habilitada),
        // usar costo por defecto del primer tier
        console.warn(
          `No se pudo calcular distancia para dirección guardada. Usando tarifa base de S/ 5.00`,
        );
        console.log("Dirección:", fullAddress);
        console.log("Error:", error.message);

        setDeliveryCost(5); // Costo del primer tier (0-1km)

        // NO mostrar error al usuario, el delivery funcionará con tarifa base
        // Para cálculo exacto, el usuario debe usar "Ubicación Actual" con el mapa
        setDistanceError(null);
      } finally {
        setIsCalculatingDistance(false);
      }
    }
  };

  // Cargar direcciones guardadas
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const data = await getAddressesApi();
        setAddresses(data);

        // Auto-seleccionar la dirección predeterminada y calcular delivery
        const defaultAddress = data.find((addr) => addr.es_predeterminada);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.direccion_id);
          setFormData((prev) => ({
            ...prev,
            address: defaultAddress.direccion_linea1,
            city: defaultAddress.distrito,
          }));

          // Calcular distancia usando la dirección completa
          const fullAddress = `${defaultAddress.direccion_linea1}, ${defaultAddress.distrito}, Lima, Perú`;

          setIsCalculatingDistance(true);
          setDistanceError(null);

          try {
            const { calculateDeliveryDistance } =
              await import("@/lib/distance-calculator");
            const result = await calculateDeliveryDistance(fullAddress);

            if (!result.isWithinCoverage) {
              setDistanceError(
                `Lo sentimos, no realizamos entregas a más de 8 km. Esta dirección está a ${result.distanceInKm.toFixed(1)} km.`,
              );
              setDeliveryCost(0);
            } else {
              setDeliveryCost(result.deliveryCost);
            }
          } catch (error: any) {
            console.warn(
              `No se pudo calcular distancia para dirección guardada. Usando tarifa base de S/ 5.00`,
            );
            setDeliveryCost(5);
            setDistanceError(null);
          } finally {
            setIsCalculatingDistance(false);
          }
        }
      } catch (error) {
        console.error("Error cargando direcciones:", error);
      }
    };

    loadAddresses();
  }, [setDeliveryCost]); // Solo depende de setDeliveryCost que es estable

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
        costo_delivery: deliveryType === "delivery" ? deliveryCost : 0, // Enviar costo de delivery calculado
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

  const calculateAndSetDeliveryCost = async (lat: number, lng: number) => {
    setIsCalculatingDistance(true);
    setDistanceError(null);

    try {
      const result = await calculateDeliveryDistanceByCoords(lat, lng);

      if (!result.isWithinCoverage) {
        setDistanceError(
          `Lo sentimos, no realizamos entregas a más de 8 km. Tu dirección está a ${result.distanceInKm.toFixed(1)} km.`,
        );
        setDeliveryCost(0);
        return false;
      }

      setDeliveryCost(result.deliveryCost);
      return true;
    } catch (error) {
      console.error("Error calculando distancia:", error);
      setDistanceError("No se pudo calcular la distancia. Intenta nuevamente.");
      setDeliveryCost(5); // Costo por defecto
      return false;
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  // Función para guardar dirección en la base de datos (Mis Direcciones)
  const handleCreateNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !newAddressForm.alias ||
      !newAddressForm.direccion_linea1 ||
      !newAddressForm.distrito
    ) {
      alert(
        "Por favor completa los campos obligatorios: Alias, Dirección y Distrito",
      );
      return;
    }

    if (tempCoordinates) {
      console.log("Coordenadas detectadas:", tempCoordinates);
      await calculateAndSetDeliveryCost(
        tempCoordinates.lat,
        tempCoordinates.lng,
      );
    }

    try {
      console.log("Creando dirección con datos:", newAddressForm);
      const newAddress = await createAddressApi(newAddressForm);
      console.log("Dirección creada:", newAddress);
      setAddresses((prev) => [...prev, newAddress]);
      setSelectedAddressId(newAddress.direccion_id);
      setFormData((prev) => ({
        ...prev,
        address: newAddress.direccion_linea1,
        city: newAddress.distrito,
      }));

      setIsNewAddressDialogOpen(false);

      // Reset form
      setNewAddressForm({
        alias: "",
        direccion_linea1: "",
        direccion_linea2: "",
        distrito: "",
        ciudad: "Lima",
        codigo_postal: "",
      });
      setTempCoordinates(null);
    } catch (error: any) {
      console.error("Error creando dirección:", error);
      console.error(
        "Detalles del error:",
        error?.response?.data || error?.message,
      );
      alert("No se pudo crear la dirección. Intenta nuevamente.");
    }
  };

  // Función para usar dirección temporal (Otra ubicación) - Guarda en BD con es_temporal: true
  const handleUseQuickAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!newAddressForm.direccion_linea1 || !newAddressForm.distrito) {
      alert("Por favor selecciona una ubicación en el mapa");
      return;
    }

    if (tempCoordinates) {
      console.log("Coordenadas detectadas:", tempCoordinates);
      await calculateAndSetDeliveryCost(
        tempCoordinates.lat,
        tempCoordinates.lng,
      );
    }

    try {
      // Guardar en BD con esTemporal: true (no aparecerá en "Mis Direcciones")
      const tempAddress = await createAddressApi({
        alias: "Dirección temporal",
        direccion_linea1: newAddressForm.direccion_linea1,
        direccion_linea2: newAddressForm.direccion_linea2 || undefined,
        distrito: newAddressForm.distrito,
        ciudad: newAddressForm.ciudad,
        codigo_postal: newAddressForm.codigo_postal || undefined,
        es_temporal: true, // 🔑 Marca como temporal
      });

      console.log("Dirección temporal creada:", tempAddress);

      setSelectedAddressId(null); // Deseleccionar direcciones guardadas
      setFormData((prev) => ({
        ...prev,
        address: tempAddress.direccion_linea1,
        city: tempAddress.distrito,
      }));

      // Guardar para mostrar en la UI
      setQuickSelectedAddress({
        direccion: tempAddress.direccion_linea1,
        distrito: tempAddress.distrito,
        ciudad: tempAddress.ciudad,
      });

      setIsQuickAddressDialogOpen(false);

      // Reset form
      setNewAddressForm({
        alias: "",
        direccion_linea1: "",
        direccion_linea2: "",
        distrito: "",
        ciudad: "Lima",
        codigo_postal: "",
      });
      setTempCoordinates(null);
    } catch (error: any) {
      console.error("Error creando dirección temporal:", error);
      alert("No se pudo guardar la dirección. Intenta nuevamente.");
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
                    className="grid grid-cols-1 gap-4"
                  >
                    {/* Temporalmente deshabilitado - solo delivery disponible */}
                    {/* <div>
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
                    </div> */}
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
                          {deliveryCost > 0
                            ? `S/ ${deliveryCost.toFixed(2)}`
                            : "Calcular según distancia"}
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
                          {distanceError && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                {distanceError}
                              </AlertDescription>
                            </Alert>
                          )}

                          {isCalculatingDistance && (
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                Calculando distancia y costo de delivery...
                              </AlertDescription>
                            </Alert>
                          )}

                          <div className="grid gap-3">
                            <Label>Dirección de Entrega *</Label>

                            <Tabs defaultValue="saved" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="saved">
                                  Mis Direcciones
                                </TabsTrigger>
                                <TabsTrigger value="quick">
                                  <MapPin className="mr-2 h-4 w-4" />
                                  Otra ubicación
                                </TabsTrigger>
                              </TabsList>

                              <TabsContent
                                value="saved"
                                className="space-y-3 mt-3"
                              >
                                {addresses.length > 0 ? (
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
                                      <label
                                        key={address.direccion_id}
                                        htmlFor={`addr-${address.direccion_id}`}
                                        className={`border rounded-lg p-3 cursor-pointer transition-colors block ${
                                          selectedAddressId ===
                                          address.direccion_id
                                            ? "border-primary bg-primary/5"
                                            : "hover:border-muted-foreground/50"
                                        }`}
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
                                              {address.distrito},{" "}
                                              {address.ciudad}
                                            </p>
                                          </div>
                                        </div>
                                      </label>
                                    ))}
                                  </RadioGroup>
                                ) : (
                                  <div className="text-center py-6 text-muted-foreground">
                                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No tienes direcciones guardadas</p>
                                  </div>
                                )}

                                <Dialog
                                  open={isNewAddressDialogOpen}
                                  onOpenChange={setIsNewAddressDialogOpen}
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
                                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>
                                        ¿Dónde quieres recibir tu pedido?
                                      </DialogTitle>
                                    </DialogHeader>
                                    <form
                                      onSubmit={handleCreateNewAddress}
                                      className="space-y-4"
                                    >
                                      <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                          Marca tu ubicación en el mapa o busca
                                          tu dirección
                                        </p>
                                        <AddressMapPicker
                                          onAddressSelect={(address) => {
                                            setNewAddressForm({
                                              ...newAddressForm,
                                              direccion_linea1:
                                                address.direccion_linea1,
                                              distrito: address.distrito,
                                              ciudad: address.ciudad,
                                              codigo_postal:
                                                address.codigo_postal,
                                            });
                                            // Guardar coordenadas si están disponibles
                                            if (address.lat && address.lng) {
                                              setTempCoordinates({
                                                lat: address.lat,
                                                lng: address.lng,
                                              });
                                            }
                                          }}
                                        />

                                        <div>
                                          <Label htmlFor="new-alias-map">
                                            Nombre / Alias *
                                          </Label>
                                          <Input
                                            id="new-alias-map"
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
                                          <Label htmlFor="new-referencia-map">
                                            Referencia / Dpto (Opcional)
                                          </Label>
                                          <Input
                                            id="new-referencia-map"
                                            placeholder="Dpto 301, Edificio B..."
                                            value={
                                              newAddressForm.direccion_linea2
                                            }
                                            onChange={(e) =>
                                              setNewAddressForm({
                                                ...newAddressForm,
                                                direccion_linea2:
                                                  e.target.value,
                                              })
                                            }
                                          />
                                        </div>

                                        <div>
                                          <Label htmlFor="new-direccion-map">
                                            Dirección (Calle y Número) *
                                          </Label>
                                          <Input
                                            id="new-direccion-map"
                                            placeholder="Av. Javier Prado 123"
                                            value={
                                              newAddressForm.direccion_linea1
                                            }
                                            onChange={(e) =>
                                              setNewAddressForm({
                                                ...newAddressForm,
                                                direccion_linea1:
                                                  e.target.value,
                                              })
                                            }
                                            required
                                          />
                                          <p className="text-xs text-muted-foreground mt-1">
                                            Puedes editar si la dirección no es
                                            exacta
                                          </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label htmlFor="new-distrito-map">
                                              Distrito *
                                            </Label>
                                            <Input
                                              id="new-distrito-map"
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
                                            <Label htmlFor="new-codigo-map">
                                              Código Postal
                                            </Label>
                                            <Input
                                              id="new-codigo-map"
                                              placeholder="15073"
                                              value={
                                                newAddressForm.codigo_postal
                                              }
                                              onChange={(e) =>
                                                setNewAddressForm({
                                                  ...newAddressForm,
                                                  codigo_postal: e.target.value,
                                                })
                                              }
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex justify-end gap-2 pt-4">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          onClick={() =>
                                            setIsNewAddressDialogOpen(false)
                                          }
                                        >
                                          Cancelar
                                        </Button>
                                        <Button type="submit">Crear</Button>
                                      </div>
                                    </form>
                                  </DialogContent>
                                </Dialog>
                              </TabsContent>

                              <TabsContent
                                value="quick"
                                className="space-y-3 mt-3"
                              >
                                <div className="border rounded-lg p-4 space-y-3">
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                      <MapPin className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                      {/* Mostrar dirección seleccionada o botón para seleccionar */}
                                      {quickSelectedAddress ? (
                                        <div className="space-y-2">
                                          <h4 className="font-medium">
                                            Dirección seleccionada
                                          </h4>
                                          <div className="bg-muted/50 rounded-md p-3">
                                            <p className="font-medium text-sm">
                                              {quickSelectedAddress.direccion}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                              {quickSelectedAddress.distrito},{" "}
                                              {quickSelectedAddress.ciudad}
                                            </p>
                                          </div>
                                        </div>
                                      ) : (
                                        <h4 className="font-medium mb-1">
                                          Seleccionar ubicación en el mapa
                                        </h4>
                                      )}
                                      <Dialog
                                        open={isQuickAddressDialogOpen}
                                        onOpenChange={
                                          setIsQuickAddressDialogOpen
                                        }
                                      >
                                        <DialogTrigger asChild>
                                          <Button
                                            className="w-full mt-2"
                                            variant={
                                              quickSelectedAddress
                                                ? "outline"
                                                : "default"
                                            }
                                          >
                                            <MapPin className="mr-2 h-4 w-4" />
                                            {quickSelectedAddress
                                              ? "Seleccionar otra dirección"
                                              : "Marcar en el Mapa"}
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                          <DialogHeader>
                                            <DialogTitle>
                                              ¿Dónde quieres recibir tu pedido?
                                            </DialogTitle>
                                          </DialogHeader>
                                          <form
                                            onSubmit={handleUseQuickAddress}
                                            className="space-y-4"
                                          >
                                            <div className="space-y-4">
                                              <p className="text-sm text-muted-foreground">
                                                Marca tu ubicación en el mapa o
                                                busca tu dirección (solo para
                                                este pedido)
                                              </p>
                                              <AddressMapPicker
                                                onAddressSelect={(address) => {
                                                  setNewAddressForm({
                                                    ...newAddressForm,
                                                    direccion_linea1:
                                                      address.direccion_linea1,
                                                    distrito: address.distrito,
                                                    ciudad: address.ciudad,
                                                    codigo_postal:
                                                      address.codigo_postal,
                                                  });
                                                  // Guardar coordenadas si están disponibles
                                                  if (
                                                    address.lat &&
                                                    address.lng
                                                  ) {
                                                    setTempCoordinates({
                                                      lat: address.lat,
                                                      lng: address.lng,
                                                    });
                                                  }
                                                }}
                                              />

                                              <div>
                                                <Label htmlFor="quick-direccion">
                                                  Dirección (Calle y Número) *
                                                </Label>
                                                <Input
                                                  id="quick-direccion"
                                                  placeholder="Av. Javier Prado 123"
                                                  value={
                                                    newAddressForm.direccion_linea1
                                                  }
                                                  onChange={(e) =>
                                                    setNewAddressForm({
                                                      ...newAddressForm,
                                                      direccion_linea1:
                                                        e.target.value,
                                                    })
                                                  }
                                                  required
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                  Puedes editar si la dirección
                                                  no es exacta
                                                </p>
                                              </div>

                                              <div>
                                                <Label htmlFor="quick-referencia">
                                                  Referencia / Dpto (Opcional)
                                                </Label>
                                                <Input
                                                  id="quick-referencia"
                                                  placeholder="Dpto 301, Edificio B, Frente al parque..."
                                                  value={
                                                    newAddressForm.direccion_linea2
                                                  }
                                                  onChange={(e) =>
                                                    setNewAddressForm({
                                                      ...newAddressForm,
                                                      direccion_linea2:
                                                        e.target.value,
                                                    })
                                                  }
                                                />
                                              </div>

                                              <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                  <Label htmlFor="quick-distrito">
                                                    Distrito *
                                                  </Label>
                                                  <Input
                                                    id="quick-distrito"
                                                    placeholder="San Isidro"
                                                    value={
                                                      newAddressForm.distrito
                                                    }
                                                    onChange={(e) =>
                                                      setNewAddressForm({
                                                        ...newAddressForm,
                                                        distrito:
                                                          e.target.value,
                                                      })
                                                    }
                                                    required
                                                  />
                                                </div>
                                                <div>
                                                  <Label htmlFor="quick-codigo">
                                                    Código Postal
                                                  </Label>
                                                  <Input
                                                    id="quick-codigo"
                                                    placeholder="15073"
                                                    value={
                                                      newAddressForm.codigo_postal
                                                    }
                                                    onChange={(e) =>
                                                      setNewAddressForm({
                                                        ...newAddressForm,
                                                        codigo_postal:
                                                          e.target.value,
                                                      })
                                                    }
                                                  />
                                                </div>
                                              </div>
                                            </div>

                                            <div className="flex justify-end gap-2 pt-4">
                                              <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                  setIsQuickAddressDialogOpen(
                                                    false,
                                                  )
                                                }
                                              >
                                                Cancelar
                                              </Button>
                                              <Button type="submit">
                                                Guardar y Usar
                                              </Button>
                                            </div>
                                          </form>
                                        </DialogContent>
                                      </Dialog>
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </div>
                        </>
                      )}
                    </div>

                    <Separator className="my-6" />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={
                        isLoading ||
                        !isMinimumMet ||
                        !!distanceError ||
                        isCalculatingDistance
                      }
                    >
                      <CreditCard className="mr-2 h-5 w-5" />
                      {isLoading
                        ? "Procesando..."
                        : isCalculatingDistance
                          ? "Calculando distancia..."
                          : "Continuar al Pago"}
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
