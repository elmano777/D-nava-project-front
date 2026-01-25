"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ClienteNav } from "@/components/cliente/cliente-nav";
import { ProductCard } from "@/components/product-card";
import { CategoryFilter } from "@/components/category-filter";
import {
  getProductsPublicApi,
  listCategoriesApi,
  ProductWithImagesDto,
  CategoryDto,
} from "@/lib/api";
import { Loader2 } from "lucide-react";

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoriaParam = searchParams.get("categoria");

  const [products, setProducts] = useState<ProductWithImagesDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const categoriesData = await listCategoriesApi({ active: true });
        setCategories(categoriesData);

        let categoriaId: number | undefined;
        if (categoriaParam) {
          const categoria = categoriesData.find(
            (c) => c.nombre.toLowerCase() === categoriaParam.toLowerCase()
          );
          if (categoria) {
            categoriaId = categoria.categoria_id;
          }
        }

        const productsData = await getProductsPublicApi({
          disponible: true,
          categoria_id: categoriaId,
        });
        setProducts(productsData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [categoriaParam]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <CategoryFilter
        categories={categories.map((c) => ({
          id: String(c.categoria_id),
          name: c.nombre,
          slug: c.nombre.toLowerCase(),
        }))}
        currentCategory={categoriaParam || undefined}
      />

      {products.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {products.map((product) => (
            <ProductCard
              key={product.producto_id}
              product={{
                id: String(product.producto_id),
                name: product.nombre,
                description: product.descripcion_breve || "",
                price_in_cents: Math.round(
                  parseFloat(product.precio_base) * 100
                ),
                image_url: product.imagenes?.[0]?.url_s3 || "/placeholder.jpg",
                stock: product.control_stock ? product.stock_actual || 0 : 999,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">
            No hay productos disponibles en esta categoría
          </p>
        </div>
      )}
    </>
  );
}

export default function ClienteDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <ClienteNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Nuestros Productos</h1>
          <p className="text-muted-foreground">
            Selecciona los productos que deseas agregar a tu carrito
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <ProductsContent />
        </Suspense>
      </main>
    </div>
  );
}
