"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart-store";

interface Product {
  id: string;
  name: string;
  description: string;
  price_in_cents: number;
  image_url: string;
  stock: number;
}

interface ProductCardClienteProps {
  product: Product;
}

export function ProductCardCliente({ product }: ProductCardClienteProps) {
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(priceInCents / 100);
  };

  const handleAddToCart = () => {
    setIsAdding(true);

    addItem({
      id: product.id,
      name: product.name,
      price_in_cents: product.price_in_cents,
      image_url: product.image_url,
    });

    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image_url || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Agotado</span>
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-bold text-lg line-clamp-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        <p className="text-2xl font-bold text-primary">
          {formatPrice(product.price_in_cents)}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || isAdding}
          className="w-full"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isAdding ? "Agregado!" : "Agregar al Carrito"}
        </Button>
      </CardFooter>
    </Card>
  );
}
