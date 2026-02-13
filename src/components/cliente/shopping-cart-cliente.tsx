"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useCartStore,
  MINIMUM_ORDER_AMOUNT,
  DELIVERY_COST,
} from "@/store/cart-store";
import { useState } from "react";

export function ShoppingCartCliente() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const {
    items,
    removeItem,
    updateQuantity,
    getTotalItems,
    getSubtotal,
    getDeliveryCost,
    getTotal,
    deliveryType,
  } = useCartStore();

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
  const totalItems = getTotalItems();

  const handleCheckout = () => {
    if (!isMinimumMet) return;
    setIsOpen(false);
    router.push("/cliente/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground font-semibold">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-2xl">
            <ShoppingBag className="h-6 w-6" />
            Tu Carrito
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-6 rounded-full bg-muted">
              <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Tu carrito está vacío</h3>
              <p className="text-muted-foreground">
                Agrega productos deliciosos de D&apos;Nava
              </p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 rounded-lg bg-muted/50"
                  >
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-background">
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold leading-tight">
                          {item.name}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 -mt-1"
                          onClick={() => removeItem(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-bold text-lg">
                          {formatPrice(item.price_in_cents * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-4 border-t">
              {!isMinimumMet && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Pedido mínimo: S/ {MINIMUM_ORDER_AMOUNT.toFixed(2)}. Te
                    faltan{" "}
                    {formatPrice(
                      Math.round((MINIMUM_ORDER_AMOUNT - subtotal) * 100),
                    )}{" "}
                    para continuar.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3 px-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {formatPrice(Math.round(subtotal * 100))}
                  </span>
                </div>
                {deliveryType === "delivery" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Delivery (estimado)
                    </span>
                    <span className="font-medium">
                      {formatPrice(Math.round(deliveryCost * 100))}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total estimado</span>
                  <span className="text-primary">
                    {formatPrice(Math.round(total * 100))}
                  </span>
                </div>

                {/* Info adicional */}
                <div className="space-y-1 text-xs text-muted-foreground pt-2">
                  <div className="flex items-start gap-2">
                    <span>💡</span>
                    <span>
                      Pedido mínimo: S/ {MINIMUM_ORDER_AMOUNT.toFixed(2)}
                      {isMinimumMet && " ✅"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>📍</span>
                    <span>
                      Delivery final: S/ 5.00 - S/ 15.00 (según distancia)
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                size="lg"
                className="w-full text-base gap-2"
                disabled={!isMinimumMet}
              >
                <ShoppingBag className="h-5 w-5" />
                {isMinimumMet ? "Proceder al Pago" : "Agrega más productos"}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
