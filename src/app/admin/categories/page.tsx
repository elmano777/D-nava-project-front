"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit } from "lucide-react";
import Link from "next/link";
import { getStoredUser } from "@/lib/auth";
import { Switch } from "@/components/ui/switch";
import {
  listCategoriesApi,
  toggleCategoryActiveApi,
  CategoryDto,
} from "@/lib/api";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryDto[]>([]);

  useEffect(() => {
    const user = getStoredUser();
    if (!user || user.rol !== "administrador") {
      router.push("/auth/login");
      return;
    }

    loadCategories();
  }, [router]);

  const loadCategories = async () => {
    try {
      const data = await listCategoriesApi();
      setCategories(data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: number, currentState: boolean) => {
    try {
      const updated = await toggleCategoryActiveApi(id, !currentState);
      setCategories((prev) =>
        prev.map((c) => (c.categoria_id === id ? updated : c)),
      );
    } catch (error) {
      console.error("Error actualizando categoría:", error);
      alert("Error al actualizar el estado de la categoría");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Categorías</h1>
            <p className="text-muted-foreground">
              Administra las categorías de productos
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Categoría
            </Link>
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No hay categorías registradas
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.categoria_id}>
                    <TableCell className="font-medium">
                      {category.nombre}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {category.descripcion || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={category.activa}
                          onCheckedChange={() =>
                            handleToggleActive(
                              category.categoria_id,
                              category.activa,
                            )
                          }
                        />
                        <Badge
                          variant={category.activa ? "default" : "secondary"}
                        >
                          {category.activa ? "Activa" : "Inactiva"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link
                          href={`/admin/categories/${category.categoria_id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
