"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getStoredUser } from "@/lib/auth";
import { listCategoriesApi, updateCategoryApi, CategoryDto } from "@/lib/api";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = Number(params.id);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [activa, setActiva] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    if (!user || user.rol !== "administrador") {
      router.push("/auth/login");
      return;
    }

    const loadCategory = async () => {
      try {
        // La API no tiene endpoint individual, usamos la lista
        const categories = await listCategoriesApi();
        const category = categories.find((c) => c.categoria_id === categoryId);

        if (!category) {
          setError("Categoría no encontrada");
          return;
        }

        setNombre(category.nombre);
        setDescripcion(category.descripcion || "");
        setActiva(category.activa);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar categoría");
      } finally {
        setIsLoading(false);
      }
    };

    loadCategory();
  }, [router, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await updateCategoryApi(categoryId, {
        nombre,
        descripcion: descripcion || undefined,
        activa,
      });
      router.push("/admin/categories");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar categoría");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Cargando categoría...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/admin/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a categorías
            </Link>
          </Button>
        </div>

        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Editar Categoría</CardTitle>
            <CardDescription>
              Modifica los datos de la categoría
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Pasteles, Panes, Postres"
                  required
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción de la categoría"
                  rows={3}
                />
              </div>

              {/* Activa */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Activa</Label>
                  <p className="text-sm text-muted-foreground">
                    La categoría está visible en la tienda
                  </p>
                </div>
                <Switch checked={activa} onCheckedChange={setActiva} />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/categories">Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
