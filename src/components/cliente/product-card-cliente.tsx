"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ShoppingCart, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart-store";

interface Product {
  id: string;
  name: string;
  description: string;
  fullDescription?: string;
  ingredients?: string;
  price_in_cents: number;
  image_url: string;
  images?: string[];
  stock: number;
}

interface ProductCardClienteProps {
  product: Product;
}

export function ProductCardCliente({ product }: ProductCardClienteProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image_url];

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

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <div className="relative aspect-square overflow-hidden bg-muted cursor-pointer">
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
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-8 w-8" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">{product.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Galería de imágenes */}
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                <img
                  src={images[currentImageIndex] || "/placeholder.svg"}
                  alt={`${product.name} - imagen ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                      onClick={handlePrevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Descripción completa */}
              {product.fullDescription && (
                <div>
                  <h4 className="font-semibold mb-2">Descripción</h4>
                  <p className="text-muted-foreground">
                    {product.fullDescription}
                  </p>
                </div>
              )}

              {/* Precio y botón de agregar */}
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(product.price_in_cents)}
                </p>
                <Button
                  onClick={() => {
                    handleAddToCart();
                    setIsDialogOpen(false);
                  }}
                  disabled={product.stock === 0 || isAdding}
                  size="lg"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {isAdding ? "Agregado!" : "Agregar al Carrito"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
    </>
  );
}
