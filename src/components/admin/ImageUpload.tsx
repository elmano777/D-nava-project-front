"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadProductImageApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, Image as ImageIcon, CheckCircle2 } from "lucide-react";

interface ImageUploadProps {
  productId: number;
  onUploadSuccess: () => void;
}

export function ImageUpload({ productId, onUploadSuccess }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setError(null);
      setSuccess(false);
      setIsUploading(true);

      // Crear preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      try {
        await uploadProductImageApi(productId, file);
        setSuccess(true);
        setPreview(null);

        // Notificar éxito y limpiar después de 2 segundos
        setTimeout(() => {
          setSuccess(false);
          onUploadSuccess();
        }, 2000);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Error al subir la imagen";
        setError(message);
        setPreview(null);
      } finally {
        setIsUploading(false);
      }
    },
    [productId, onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: isUploading,
  });

  const clearPreview = () => {
    setPreview(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
          ${isUploading ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-muted/50"}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-3">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 rounded-md"
              />
              {!isUploading && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearPreview();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-full bg-muted p-4">
                {isUploading ? (
                  <Upload className="h-8 w-8 text-muted-foreground animate-bounce" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>

              {isDragActive ? (
                <p className="text-sm font-medium">Suelta la imagen aquí...</p>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-medium mb-1">
                      Arrastra una imagen o haz click para seleccionar
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, JPEG, GIF o WEBP (máx. 5MB)
                    </p>
                  </div>
                </>
              )}
            </>
          )}

          {isUploading && (
            <p className="text-sm text-primary font-medium">Subiendo imagen...</p>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ¡Imagen subida exitosamente!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
