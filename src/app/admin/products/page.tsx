"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { ProductsTable } from "@/components/admin/products-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getStoredUser } from "@/lib/auth";
import { listProductsApi, updateProductApi, ProductDto } from "@/lib/api";

export default function AdminProductsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<ProductDto[]>([]);

  useEffect(() => {
    const user = getStoredUser();

    if (!user || user.rol !== "administrador") {
      router.push("/auth/login");
      return;
    }

    const loadProducts = async () => {
      try {
        const data = await listProductsApi();
        setProducts(data);
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [router]);

  const handleToggleDisponible = async (id: number, currentState: boolean) => {
    try {
      const updated = await updateProductApi(id, { disponible: !currentState });
      setProducts((prev) =>
        prev.map((p) =>
          p.producto_id === id ? { ...p, disponible: updated.disponible } : p,
        ),
      );
    } catch (error) {
      console.error("Error actualizando producto:", error);
      alert("Error al actualizar el estado del producto");
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
            <h1 className="text-3xl font-bold mb-2">Gestionar Productos</h1>
            <p className="text-muted-foreground">
              Administra el catálogo de productos
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Link>
          </Button>
        </div>

        <ProductsTable
          products={products}
          onToggleDisponible={handleToggleDisponible}
        />
      </main>
    </div>
  );
}
