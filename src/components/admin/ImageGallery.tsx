"use client";

import { useState } from "react";
import { deleteImageApi, reorderImageApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, MoveUp, MoveDown, Image as ImageIcon } from "lucide-react";

interface Image {
  imagen_id: number;
  url_s3: string;
  orden: number;
}

interface ImageGalleryProps {
  images: Image[];
  onUpdate: () => void;
}

export function ImageGallery({ images, onUpdate }: ImageGalleryProps) {
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sortedImages = [...images].sort((a, b) => a.orden - b.orden);

  const handleDelete = async (imageId: number) => {
    if (!confirm("¿Estás seguro de eliminar esta imagen?")) return;

    setIsDeleting(imageId);
    setError(null);

    try {
      await deleteImageApi(imageId);
      onUpdate();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al eliminar la imagen";
      setError(message);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleReorder = async (imageId: number, direction: "up" | "down") => {
    const currentIndex = sortedImages.findIndex(
      (img) => img.imagen_id === imageId
    );
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= sortedImages.length) return;

    setIsReordering(imageId);
    setError(null);

    try {
      // El nuevo orden es el orden de la imagen con la que intercambiamos
      const newOrden = sortedImages[newIndex].orden;
      await reorderImageApi(imageId, newOrden);

      // Actualizar también la otra imagen
      const otherImageId = sortedImages[newIndex].imagen_id;
      const currentOrden = sortedImages[currentIndex].orden;
      await reorderImageApi(otherImageId, currentOrden);

      onUpdate();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al reordenar las imágenes";
      setError(message);
    } finally {
      setIsReordering(null);
    }
  };

  if (images.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Imágenes del Producto</CardTitle>
          <CardDescription>
            Este producto aún no tiene imágenes. Sube la primera imagen arriba.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ImageIcon className="h-16 w-16 mb-4" />
            <p className="text-sm">No hay imágenes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Imágenes del Producto ({images.length})</CardTitle>
        <CardDescription>
          Gestiona las imágenes del producto. El orden determina cómo se
          mostrarán a los clientes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedImages.map((image, index) => (
            <div
              key={image.imagen_id}
              className="relative group rounded-lg border overflow-hidden bg-muted"
            >
              {/* Orden Badge */}
              <div className="absolute top-2 left-2 z-10">
                <span className="bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
                  #{index + 1}
                </span>
              </div>

              {/* Imagen */}
              <div className="aspect-square relative">
                <img
                  src={image.url_s3}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Controles (aparecen en hover) */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {/* Mover arriba */}
                <Button
                  size="icon"
                  variant="secondary"
                  disabled={index === 0 || isReordering !== null}
                  onClick={() => handleReorder(image.imagen_id, "up")}
                  title="Mover arriba"
                >
                  <MoveUp className="h-4 w-4" />
                </Button>

                {/* Mover abajo */}
                <Button
                  size="icon"
                  variant="secondary"
                  disabled={
                    index === sortedImages.length - 1 || isReordering !== null
                  }
                  onClick={() => handleReorder(image.imagen_id, "down")}
                  title="Mover abajo"
                >
                  <MoveDown className="h-4 w-4" />
                </Button>

                {/* Eliminar */}
                <Button
                  size="icon"
                  variant="destructive"
                  disabled={isDeleting !== null}
                  onClick={() => handleDelete(image.imagen_id)}
                  title="Eliminar imagen"
                >
                  {isDeleting === image.imagen_id ? (
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Indicador de carga */}
              {isReordering === image.imagen_id && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="h-8 w-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
          <strong>Tip:</strong> La primera imagen (#1) es la que aparecerá como
          imagen principal del producto en el catálogo.
        </div>
      </CardContent>
    </Card>
  );
}
